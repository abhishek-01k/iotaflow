module iotaflow::token_lock {
    // Import needed modules and functions
    use iota::coin::{Coin, value, split, from_balance, into_balance, destroy_zero};
    use iota::transfer::{transfer, public_transfer};
    use iota::tx_context;
    use iota::object;
    use iota::balance;
    use iota::clock;
    use iota::event::emit;

    // Error codes - removed unused constant E_NOT_AUTHORIZED
    const E_INVALID_LOCK_PERIOD: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const E_LOCK_NOT_EXPIRED: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;

    // Lock types
    const FIXED_UNLOCK: u8 = 0;
    const GRADUAL_UNLOCK: u8 = 1;

    // Lock status
    const LOCKED: u8 = 0;
    const UNLOCKED: u8 = 1;
    const PARTIALLY_UNLOCKED: u8 = 2;

    // Define coin type for the module
    public struct LOCK has drop {}

    // Token lock object
    public struct TokenLock has key, store {
        id: object::UID,
        owner: address,
        lock_amount: u64,
        unlocked_amount: u64,
        lock_timestamp: u64,
        unlock_timestamp: u64,
        lock_type: u8,
        status: u8,
        balance: balance::Balance<LOCK>
    }

    // Event for lock creation
    public struct TokenLockCreatedEvent has copy, drop {
        owner: address,
        amount: u64,
        lock_timestamp: u64,
        unlock_timestamp: u64,
        lock_type: u8
    }

    // Event for token unlock
    public struct TokenUnlockEvent has copy, drop {
        lock_id: address,
        owner: address,
        amount: u64,
        timestamp: u64
    }

    // Create a new token lock with fixed unlock date
    public entry fun create_fixed_lock(
        amount: u64,
        unlock_timestamp: u64,
        mut coin_in: Coin<LOCK>,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < unlock_timestamp, E_INVALID_LOCK_PERIOD);
        assert!(value(&coin_in) >= amount, E_INSUFFICIENT_BALANCE);

        // Extract the exact amount needed
        let lock_coin = split(&mut coin_in, amount, ctx);
        let balance = into_balance(lock_coin);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };

        // Create token lock
        let token_lock = TokenLock {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            lock_amount: amount,
            unlocked_amount: 0,
            lock_timestamp: current_time,
            unlock_timestamp,
            lock_type: FIXED_UNLOCK,
            status: LOCKED,
            balance
        };

        // Emit event
        emit(TokenLockCreatedEvent {
            owner: tx_context::sender(ctx),
            amount,
            lock_timestamp: current_time,
            unlock_timestamp,
            lock_type: FIXED_UNLOCK
        });

        // Transfer to owner (still locked)
        transfer(token_lock, tx_context::sender(ctx));
    }

    // Create a new token lock with gradual unlock
    public entry fun create_gradual_lock(
        amount: u64,
        unlock_timestamp: u64,
        mut coin_in: Coin<LOCK>,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < unlock_timestamp, E_INVALID_LOCK_PERIOD);
        assert!(value(&coin_in) >= amount, E_INSUFFICIENT_BALANCE);

        // Extract the exact amount needed
        let lock_coin = split(&mut coin_in, amount, ctx);
        let balance = into_balance(lock_coin);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };

        // Create token lock
        let token_lock = TokenLock {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            lock_amount: amount,
            unlocked_amount: 0,
            lock_timestamp: current_time,
            unlock_timestamp,
            lock_type: GRADUAL_UNLOCK,
            status: LOCKED,
            balance
        };

        // Emit event
        emit(TokenLockCreatedEvent {
            owner: tx_context::sender(ctx),
            amount,
            lock_timestamp: current_time,
            unlock_timestamp,
            lock_type: GRADUAL_UNLOCK
        });

        // Transfer to owner (still locked)
        transfer(token_lock, tx_context::sender(ctx));
    }

    // Calculate unlockable amount for gradual unlock
    public fun calculate_unlockable_amount(
        lock: &TokenLock,
        current_time: u64
    ): u64 {
        if (lock.lock_type == FIXED_UNLOCK) {
            if (current_time >= lock.unlock_timestamp) {
                return lock.lock_amount - lock.unlocked_amount
            } else {
                return 0
            }
        } else { // GRADUAL_UNLOCK
            if (current_time < lock.lock_timestamp) {
                return 0
            };

            if (current_time >= lock.unlock_timestamp) {
                return lock.lock_amount - lock.unlocked_amount
            };

            // Calculate based on time passed
            let time_passed = current_time - lock.lock_timestamp;
            let total_lock_period = lock.unlock_timestamp - lock.lock_timestamp;
            
            let unlockable = (lock.lock_amount * time_passed) / total_lock_period;
            if (unlockable <= lock.unlocked_amount) {
                return 0
            };
            
            unlockable - lock.unlocked_amount
        }
    }

    // Unlock tokens from a lock
    public entry fun unlock(
        lock: &mut TokenLock,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure lock exists
        assert!(lock.status != UNLOCKED, E_LOCK_NOT_EXPIRED);
        
        // Get current timestamp from clock
        let current_time = clock::timestamp_ms(clock);
        
        // Calculate unlockable amount
        let unlockable = calculate_unlockable_amount(lock, current_time);
        assert!(unlockable > 0, E_LOCK_NOT_EXPIRED);

        // Update lock
        lock.unlocked_amount = lock.unlocked_amount + unlockable;
        
        // Create coin from balance
        let unlock_coin = from_balance(balance::split(&mut lock.balance, unlockable), ctx);
        
        // Check if fully unlocked
        if (lock.unlocked_amount == lock.lock_amount) {
            lock.status = UNLOCKED;
        } else {
            lock.status = PARTIALLY_UNLOCKED;
        };

        // Emit unlock event
        emit(TokenUnlockEvent {
            lock_id: object::uid_to_address(&lock.id),
            owner: lock.owner,
            amount: unlockable,
            timestamp: current_time
        });

        // Transfer coins to owner
        public_transfer(unlock_coin, lock.owner);
    }

    // Get lock details - public view function
    public fun get_lock_details(lock: &TokenLock): (
        address, u64, u64, u64, u64, u8, u8
    ) {
        (
            lock.owner,
            lock.lock_amount,
            lock.unlocked_amount,
            lock.lock_timestamp,
            lock.unlock_timestamp,
            lock.lock_type,
            lock.status
        )
    }
} 