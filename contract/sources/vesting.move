module iotaflow::vesting {
    // Import needed modules and functions
    use iota::coin::{Coin, value, split, from_balance, into_balance, destroy_zero};
    use iota::transfer::{share_object, public_transfer};
    use iota::tx_context;
    use iota::object;
    use iota::balance;
    use iota::clock;
    use iota::event::emit;

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_SCHEDULE: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const E_NO_VESTING_FOUND: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_VESTING_NOT_STARTED: u64 = 6;
    // Removed unused constant E_SCHEDULE_ALREADY_CREATED

    // Vesting types
    const LINEAR_VESTING: u8 = 0;
    const CLIFF_VESTING: u8 = 1;

    // Vesting status
    const ACTIVE: u8 = 0;
    const CANCELLED: u8 = 1;
    const COMPLETED: u8 = 2;

    // Define coin type for the module
    public struct VESTING has drop {}

    // Vesting schedule object
    public struct VestingSchedule has key, store {
        id: object::UID,
        creator: address,
        recipient: address,
        total_amount: u64,
        released_amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        cliff_timestamp: u64, // 0 for linear vesting
        vesting_type: u8,
        status: u8,
        balance: balance::Balance<VESTING>
    }

    // Event for vesting creation
    public struct VestingCreatedEvent has copy, drop {
        creator: address,
        recipient: address,
        amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        vesting_type: u8
    }

    // Event for vesting claim
    public struct VestingClaimEvent has copy, drop {
        schedule_id: address,
        recipient: address,
        amount: u64,
        timestamp: u64
    }

    // Create a new linear vesting schedule
    public entry fun create_linear_vesting(
        recipient: address,
        amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        mut coin_in: Coin<VESTING>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(start_timestamp < end_timestamp, E_INVALID_SCHEDULE);
        assert!(value(&coin_in) >= amount, E_INSUFFICIENT_BALANCE);

        // Extract the exact amount needed
        let payment_coin = split(&mut coin_in, amount, ctx);
        let balance = into_balance(payment_coin);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };

        // Create vesting schedule
        let vesting = VestingSchedule {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            recipient,
            total_amount: amount,
            released_amount: 0,
            start_timestamp,
            end_timestamp,
            cliff_timestamp: 0, // No cliff for linear vesting
            vesting_type: LINEAR_VESTING,
            status: ACTIVE,
            balance
        };

        // Emit event
        emit(VestingCreatedEvent {
            creator: tx_context::sender(ctx),
            recipient,
            amount,
            start_timestamp,
            end_timestamp,
            vesting_type: LINEAR_VESTING
        });

        // Transfer to recipient
        share_object(vesting);
    }

    // Create a new cliff vesting schedule
    public entry fun create_cliff_vesting(
        recipient: address,
        amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        cliff_timestamp: u64,
        mut coin_in: Coin<VESTING>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(start_timestamp < cliff_timestamp, E_INVALID_SCHEDULE);
        assert!(cliff_timestamp < end_timestamp, E_INVALID_SCHEDULE);
        assert!(value(&coin_in) >= amount, E_INSUFFICIENT_BALANCE);

        // Extract the exact amount needed
        let payment_coin = split(&mut coin_in, amount, ctx);
        let balance = into_balance(payment_coin);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };

        // Create vesting schedule
        let vesting = VestingSchedule {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            recipient,
            total_amount: amount,
            released_amount: 0,
            start_timestamp,
            end_timestamp,
            cliff_timestamp,
            vesting_type: CLIFF_VESTING,
            status: ACTIVE,
            balance
        };

        // Emit event
        emit(VestingCreatedEvent {
            creator: tx_context::sender(ctx),
            recipient,
            amount,
            start_timestamp,
            end_timestamp,
            vesting_type: CLIFF_VESTING
        });

        // Transfer to recipient
        share_object(vesting);
    }

    // Calculate releasable amount for vesting schedule
    public fun calculate_releasable_amount(
        vesting: &VestingSchedule,
        current_time: u64
    ): u64 {
        if (current_time < vesting.start_timestamp) {
            return 0
        };

        if (current_time >= vesting.end_timestamp) {
            return vesting.total_amount - vesting.released_amount
        };

        if (vesting.vesting_type == CLIFF_VESTING && current_time < vesting.cliff_timestamp) {
            return 0
        };

        let time_passed;
        let time_delta;
        
        if (vesting.vesting_type == CLIFF_VESTING && current_time >= vesting.cliff_timestamp) {
            // For cliff vesting after cliff is reached
            time_passed = current_time - vesting.cliff_timestamp;
            time_delta = vesting.end_timestamp - vesting.cliff_timestamp;
        } else {
            // For linear vesting
            time_passed = current_time - vesting.start_timestamp;
            time_delta = vesting.end_timestamp - vesting.start_timestamp;
        };

        let vested_amount = (vesting.total_amount * time_passed) / time_delta;
        vested_amount - vesting.released_amount
    }

    // Claim tokens from a vesting schedule
    public entry fun claim(
        vesting: &mut VestingSchedule,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure vesting is active
        assert!(vesting.status == ACTIVE, E_NO_VESTING_FOUND);
        
        // Get current timestamp from clock
        let current_time = clock::timestamp_ms(clock);
        
        // Calculate releasable amount
        let releasable = calculate_releasable_amount(vesting, current_time);
        assert!(releasable > 0, E_VESTING_NOT_STARTED);

        // Update vesting schedule
        vesting.released_amount = vesting.released_amount + releasable;
        
        // Create coin from balance
        let release_coin = from_balance(balance::split(&mut vesting.balance, releasable), ctx);
        
        // Check if vesting is completed
        if (vesting.released_amount == vesting.total_amount) {
            vesting.status = COMPLETED;
        };

        // Emit claim event
        emit(VestingClaimEvent {
            schedule_id: object::uid_to_address(&vesting.id),
            recipient: vesting.recipient,
            amount: releasable,
            timestamp: current_time
        });

        // Transfer coins to recipient
        public_transfer(release_coin, vesting.recipient);
    }

    // Cancel vesting (only creator can call)
    public entry fun cancel_vesting(
        vesting: &mut VestingSchedule,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure caller is the creator
        assert!(tx_context::sender(ctx) == vesting.creator, E_NOT_AUTHORIZED);
        
        // Ensure vesting is active
        assert!(vesting.status == ACTIVE, E_NO_VESTING_FOUND);

        // Update vesting schedule
        vesting.status = CANCELLED;
        
        // Calculate remaining amount
        let remaining = vesting.total_amount - vesting.released_amount;
        
        if (remaining > 0) {
            // Create coin from balance
            let remaining_coin = from_balance(balance::split(&mut vesting.balance, remaining), ctx);
            
            // Transfer remaining coins back to creator
            public_transfer(remaining_coin, vesting.creator);
        };
    }

    // Get vesting details - public view function
    public fun get_vesting_details(vesting: &VestingSchedule): (
        address, address, u64, u64, u64, u64, u64, u8, u8
    ) {
        (
            vesting.creator,
            vesting.recipient,
            vesting.total_amount,
            vesting.released_amount,
            vesting.start_timestamp,
            vesting.end_timestamp,
            vesting.cliff_timestamp,
            vesting.vesting_type,
            vesting.status
        )
    }
} 