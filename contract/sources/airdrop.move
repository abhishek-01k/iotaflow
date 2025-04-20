module iotaflow::airdrop {
    // Import needed modules and functions
    use iota::coin::{Coin, value, split, from_balance, into_balance, destroy_zero};
    use iota::transfer::{public_transfer, share_object};
    use iota::tx_context;
    use iota::object;
    use iota::table;
    use iota::balance;
    use iota::clock;
    use iota::event::emit;
    use std::vector;

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ZERO_AMOUNT: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_ZERO_RECIPIENTS: u64 = 4;
    const E_AMOUNTS_MISMATCH: u64 = 5;
    const E_AIRDROP_CLOSED: u64 = 6;
    const E_ALREADY_CLAIMED: u64 = 7;
    const E_INVALID_SCHEDULE: u64 = 9;
    const E_INVALID_AIRDROP_TYPE: u64 = 10;

    // Airdrop types
    const INSTANT_AIRDROP: u8 = 0;
    const VESTED_AIRDROP: u8 = 1;

    // Airdrop status
    const ACTIVE: u8 = 0;
    const CLOSED: u8 = 1;

    // Define coin type for the module
    public struct AIRDROP has drop {}

    // Airdrop object
    public struct Airdrop has key, store {
        id: object::UID,
        creator: address,
        total_amount: u64,
        distributed_amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        airdrop_type: u8,
        status: u8,
        claimed: table::Table<address, bool>,
        balance: balance::Balance<AIRDROP>,
    }

    // Event for airdrop creation
    public struct AirdropCreatedEvent has copy, drop {
        creator: address,
        total_amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        airdrop_type: u8
    }

    // Event for claim
    public struct AirdropClaimEvent has copy, drop {
        airdrop_id: address,
        recipient: address,
        amount: u64,
        timestamp: u64
    }

    // Create a new instant airdrop
    public entry fun create_instant_airdrop(
        total_amount: u64,
        mut coin_in: Coin<AIRDROP>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(total_amount > 0, E_ZERO_AMOUNT);
        assert!(value(&coin_in) >= total_amount, E_INSUFFICIENT_BALANCE);

        // Extract the exact amount needed
        let payment_coin = split(&mut coin_in, total_amount, ctx);
        let balance = into_balance(payment_coin);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };

        // Create airdrop
        let airdrop_id = object::new(ctx);
        let _airdrop_addr = object::uid_to_address(&airdrop_id);
        
        let airdrop = Airdrop {
            id: airdrop_id,
            creator: tx_context::sender(ctx),
            total_amount,
            distributed_amount: 0,
            // For instant airdrops, start and end are the same (now)
            start_timestamp: tx_context::epoch_timestamp_ms(ctx),
            end_timestamp: tx_context::epoch_timestamp_ms(ctx),
            airdrop_type: INSTANT_AIRDROP,
            status: ACTIVE,
            claimed: table::new(ctx),
            balance
        };

        // Emit event
        emit(AirdropCreatedEvent {
            creator: tx_context::sender(ctx),
            total_amount,
            start_timestamp: tx_context::epoch_timestamp_ms(ctx),
            end_timestamp: tx_context::epoch_timestamp_ms(ctx),
            airdrop_type: INSTANT_AIRDROP
        });

        // Share airdrop object
        share_object(airdrop);
    }

    // Create a new vested airdrop
    public entry fun create_vested_airdrop(
        total_amount: u64,
        start_timestamp: u64,
        end_timestamp: u64,
        mut coin_in: Coin<AIRDROP>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(total_amount > 0, E_ZERO_AMOUNT);
        assert!(value(&coin_in) >= total_amount, E_INSUFFICIENT_BALANCE);
        assert!(start_timestamp < end_timestamp, E_INVALID_SCHEDULE);

        // Extract the exact amount needed
        let payment_coin = split(&mut coin_in, total_amount, ctx);
        let balance = into_balance(payment_coin);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };

        // Create airdrop
        let airdrop_id = object::new(ctx);
        let _airdrop_addr = object::uid_to_address(&airdrop_id);
        
        let airdrop = Airdrop {
            id: airdrop_id,
            creator: tx_context::sender(ctx),
            total_amount,
            distributed_amount: 0,
            start_timestamp,
            end_timestamp,
            airdrop_type: VESTED_AIRDROP,
            status: ACTIVE,
            claimed: table::new(ctx),
            balance
        };

        // Emit event
        emit(AirdropCreatedEvent {
            creator: tx_context::sender(ctx),
            total_amount,
            start_timestamp,
            end_timestamp,
            airdrop_type: VESTED_AIRDROP
        });

        // Share airdrop object
        share_object(airdrop);
    }

    // Distribute to recipients for instant airdrop
    public entry fun distribute_instant(
        airdrop: &mut Airdrop,
        recipients: vector<address>,
        amounts: vector<u64>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(tx_context::sender(ctx) == airdrop.creator, E_NOT_AUTHORIZED);
        assert!(airdrop.status == ACTIVE, E_AIRDROP_CLOSED);
        assert!(airdrop.airdrop_type == INSTANT_AIRDROP, E_INVALID_AIRDROP_TYPE);
        
        // Ensure recipients and amounts are valid
        let recipients_len = vector::length(&recipients);
        let amounts_len = vector::length(&amounts);
        
        assert!(recipients_len > 0, E_ZERO_RECIPIENTS);
        assert!(recipients_len == amounts_len, E_AMOUNTS_MISMATCH);
        
        // Calculate total amount to distribute
        let mut total_to_distribute = 0;
        let mut i = 0;
        while (i < recipients_len) {
            total_to_distribute = total_to_distribute + *vector::borrow(&amounts, i);
            i = i + 1;
        };
        
        // Ensure we have enough balance
        assert!(total_to_distribute <= (airdrop.total_amount - airdrop.distributed_amount), E_INSUFFICIENT_BALANCE);
        
        // Update distributed amount
        airdrop.distributed_amount = airdrop.distributed_amount + total_to_distribute;
        
        // Distribute to each recipient
        let mut i = 0;
        while (i < recipients_len) {
            let recipient_addr = *vector::borrow(&recipients, i);
            let amount = *vector::borrow(&amounts, i);
            
            if (amount > 0) {
                // Create coin from balance
                let recipient_coin = from_balance(balance::split(&mut airdrop.balance, amount), ctx);
                
                // Add to claimed
                table::add(&mut airdrop.claimed, recipient_addr, true);
                
                // Emit claim event
                emit(AirdropClaimEvent {
                    airdrop_id: object::uid_to_address(&airdrop.id),
                    recipient: recipient_addr,
                    amount,
                    timestamp: tx_context::epoch_timestamp_ms(ctx)
                });
                
                // Transfer to recipient
                public_transfer(recipient_coin, recipient_addr);
            };
            
            i = i + 1;
        };
    }

    // Distribute to recipients for vested airdrop
    public entry fun distribute_vested(
        airdrop: &mut Airdrop,
        recipients: vector<address>,
        amounts: vector<u64>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(tx_context::sender(ctx) == airdrop.creator, E_NOT_AUTHORIZED);
        assert!(airdrop.status == ACTIVE, E_AIRDROP_CLOSED);
        assert!(airdrop.airdrop_type == VESTED_AIRDROP, E_INVALID_AIRDROP_TYPE);
        
        // Ensure recipients and amounts are valid
        let recipients_len = vector::length(&recipients);
        let amounts_len = vector::length(&amounts);
        
        assert!(recipients_len > 0, E_ZERO_RECIPIENTS);
        assert!(recipients_len == amounts_len, E_AMOUNTS_MISMATCH);
        
        // Calculate total amount to distribute
        let mut total_to_distribute = 0;
        let mut i = 0;
        while (i < recipients_len) {
            total_to_distribute = total_to_distribute + *vector::borrow(&amounts, i);
            i = i + 1;
        };
        
        // Ensure we have enough balance
        assert!(total_to_distribute <= (airdrop.total_amount - airdrop.distributed_amount), E_INSUFFICIENT_BALANCE);
        
        // Update distributed amount
        airdrop.distributed_amount = airdrop.distributed_amount + total_to_distribute;
        
        // Store vesting info for each recipient
        let mut i = 0;
        while (i < recipients_len) {
            let recipient_addr = *vector::borrow(&recipients, i);
            let amount = *vector::borrow(&amounts, i);
            
            if (amount > 0) {
                // Add to claimed (initially false for vested airdrop)
                table::add(&mut airdrop.claimed, recipient_addr, false);
            };
            
            i = i + 1;
        };
    }

    // Claim tokens from vested airdrop
    public entry fun claim_vested(
        airdrop: &mut Airdrop, 
        amount: u64,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure airdrop is active
        assert!(airdrop.status == ACTIVE, E_AIRDROP_CLOSED);
        
        // Get recipient address
        let recipient_addr = tx_context::sender(ctx);
        
        // Check that the recipient is eligible and hasn't claimed yet
        assert!(!table::contains(&airdrop.claimed, recipient_addr), E_ALREADY_CLAIMED);
        
        // Ensure we have enough balance
        assert!(airdrop.distributed_amount + amount <= airdrop.total_amount, E_INSUFFICIENT_BALANCE);
        
        // Create coin from balance
        let recipient_coin = from_balance(balance::split(&mut airdrop.balance, amount), ctx);
        
        // Mark as claimed
        table::add(&mut airdrop.claimed, recipient_addr, true);
        
        // Update distributed amount
        airdrop.distributed_amount = airdrop.distributed_amount + amount;
        
        let _current_time = clock::timestamp_ms(clock);
        
        // Emit claim event
        emit(AirdropClaimEvent {
            airdrop_id: object::uid_to_address(&airdrop.id),
            recipient: recipient_addr,
            amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx)
        });
        
        // Transfer to recipient
        public_transfer(recipient_coin, recipient_addr);
    }

    // Close airdrop and return unused funds to creator
    public entry fun close_airdrop(
        airdrop: &mut Airdrop,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure caller is the creator
        assert!(tx_context::sender(ctx) == airdrop.creator, E_NOT_AUTHORIZED);
        
        // Update airdrop status
        assert!(airdrop.status == ACTIVE, E_AIRDROP_CLOSED);
        
        // Set as closed
        airdrop.status = CLOSED;
        
        // Calculate remaining amount
        let remaining = airdrop.total_amount - airdrop.distributed_amount;
        
        if (remaining > 0) {
            // Create coin from balance
            let remaining_coin = from_balance(balance::split(&mut airdrop.balance, remaining), ctx);
            
            // Transfer remaining coins back to creator
            public_transfer(remaining_coin, airdrop.creator);
        };
    }
} 