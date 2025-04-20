module iotaflow::payment {
    // Import needed modules and functions
    use iota::coin::{Coin, value, split, from_balance, into_balance, destroy_zero};
    use iota::transfer::{share_object, public_transfer};
    use iota::tx_context;
    use iota::object;
    use iota::table;
    use iota::balance;
    use iota::clock;
    use iota::event::emit;
    
    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ZERO_AMOUNT: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_PAYMENT_NOT_DUE: u64 = 4;
    const E_NO_PAYMENT_DUE: u64 = 5;
    const E_INVALID_INTERVAL: u64 = 6;
    const E_PAYMENT_CLOSED: u64 = 7;

    // Payment types
    const ONE_TIME_PAYMENT: u8 = 0;
    const RECURRING_PAYMENT: u8 = 1;

    // Payment status
    const ACTIVE: u8 = 0;
    const COMPLETED: u8 = 1;
    const CANCELLED: u8 = 2;

    // Define coin type for the module
    public struct PAYMENT has drop {}

    // Payment object
    public struct Payment has key, store {
        id: object::UID,
        creator: address,
        recipient: address,
        amount: u64,
        payment_type: u8,
        status: u8,
        start_timestamp: u64,
        interval: u64, // in milliseconds, 0 for one-time
        next_payment_due: u64,
        balance: balance::Balance<PAYMENT>,
        // Keep track of executed payments
        payments: table::Table<u64, bool> // timestamp -> paid
    }

    // Event for payment creation
    public struct PaymentCreatedEvent has copy, drop {
        payment_id: address,
        creator: address,
        recipient: address,
        amount: u64,
        payment_type: u8,
        start_timestamp: u64,
        interval: u64
    }

    // Event for payment execution
    public struct PaymentExecutedEvent has copy, drop {
        payment_id: address,
        recipient: address,
        amount: u64,
        timestamp: u64
    }

    // Create a one-time payment
    public entry fun create_one_time_payment(
        recipient: address,
        amount: u64,
        due_timestamp: u64,
        mut coin_in: Coin<PAYMENT>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(amount > 0, E_ZERO_AMOUNT);
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

        // Create payment
        let payment_id = object::new(ctx);
        let payments = table::new<u64, bool>(ctx);
        
        let payment = Payment {
            id: payment_id,
            creator: tx_context::sender(ctx),
            recipient,
            amount,
            payment_type: ONE_TIME_PAYMENT,
            status: ACTIVE,
            start_timestamp: due_timestamp,
            interval: 0, // No interval for one-time
            next_payment_due: due_timestamp,
            balance,
            payments
        };

        // Emit event
        emit(PaymentCreatedEvent {
            payment_id: object::uid_to_address(&payment.id),
            creator: tx_context::sender(ctx),
            recipient,
            amount,
            payment_type: ONE_TIME_PAYMENT,
            start_timestamp: due_timestamp,
            interval: 0
        });

        // Share payment object
        share_object(payment);
    }

    // Create a recurring payment
    public entry fun create_recurring_payment(
        recipient: address,
        amount: u64,
        start_timestamp: u64,
        interval: u64, // milliseconds
        num_payments: u64,
        mut coin_in: Coin<PAYMENT>,
        ctx: &mut tx_context::TxContext
    ) {
        // Validations
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(interval > 0, E_INVALID_INTERVAL);
        
        let total_amount = amount * num_payments;
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

        // Create payment
        let payment_id = object::new(ctx);
        let payments = table::new<u64, bool>(ctx);
        
        let payment = Payment {
            id: payment_id,
            creator: tx_context::sender(ctx),
            recipient,
            amount,
            payment_type: RECURRING_PAYMENT,
            status: ACTIVE,
            start_timestamp,
            interval,
            next_payment_due: start_timestamp,
            balance,
            payments
        };

        // Emit event
        emit(PaymentCreatedEvent {
            payment_id: object::uid_to_address(&payment.id),
            creator: tx_context::sender(ctx),
            recipient,
            amount,
            payment_type: RECURRING_PAYMENT,
            start_timestamp,
            interval
        });

        // Share payment object
        share_object(payment);
    }

    // Check if payment is due and execute it
    public entry fun execute_payment(
        payment: &mut Payment,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure payment is active
        assert!(payment.status == ACTIVE, E_PAYMENT_CLOSED);
        
        // Get current timestamp from clock
        let current_time = clock::timestamp_ms(clock);
        
        // Check if payment is due
        assert!(current_time >= payment.next_payment_due, E_PAYMENT_NOT_DUE);
        
        // For recurring payments, calculate how many intervals have passed
        let mut intervals_passed = 1; // Default for one-time
        
        if (payment.payment_type == RECURRING_PAYMENT) {
            // Calculate intervals passed since next payment due
            intervals_passed = (current_time - payment.next_payment_due) / payment.interval + 1;
        };
        
        assert!(intervals_passed > 0, E_NO_PAYMENT_DUE);
        
        // Calculate amount to pay (handle max payments)
        let max_payments = if (payment.payment_type == ONE_TIME_PAYMENT) { 1 } else { 
            balance::value(&payment.balance) / payment.amount 
        };
        
        let payments_to_execute = if (intervals_passed > max_payments) { max_payments } else { intervals_passed };
        
        let amount_to_pay = payment.amount * payments_to_execute;
        assert!(amount_to_pay > 0, E_NO_PAYMENT_DUE);
        
        // Update next payment due
        if (payment.payment_type == RECURRING_PAYMENT && payments_to_execute < intervals_passed) {
            payment.next_payment_due = payment.next_payment_due + (payment.interval * payments_to_execute);
        } else {
            // For one-time or last recurring payment
            payment.status = COMPLETED;
        };
        
        // Add to payment history
        table::add(&mut payment.payments, current_time, true);
        
        // Create payment coin
        let payment_coin = from_balance(balance::split(&mut payment.balance, amount_to_pay), ctx);
        
        // Emit event
        emit(PaymentExecutedEvent {
            payment_id: object::uid_to_address(&payment.id),
            recipient: payment.recipient,
            amount: amount_to_pay,
            timestamp: current_time
        });
        
        // Transfer to recipient
        public_transfer(payment_coin, payment.recipient);
    }

    // Cancel payment and return funds to creator
    public entry fun cancel_payment(
        payment: &mut Payment,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure caller is the creator
        assert!(tx_context::sender(ctx) == payment.creator, E_NOT_AUTHORIZED);
        
        // Ensure payment is active
        assert!(payment.status == ACTIVE, E_PAYMENT_CLOSED);
        
        // Update payment status
        payment.status = CANCELLED;
        
        // Check if there are remaining funds
        let remaining = balance::value(&payment.balance);
        
        if (remaining > 0) {
            // Create coin from balance
            let remaining_coin = from_balance(balance::split(&mut payment.balance, remaining), ctx);
            
            // Transfer remaining coins back to creator
            public_transfer(remaining_coin, payment.creator);
        };
    }

    // Top up a payment with additional funds
    public entry fun add_funds(
        payment: &mut Payment,
        amount: u64,
        mut coin_in: Coin<PAYMENT>,
        ctx: &mut tx_context::TxContext
    ) {
        // Ensure caller is the creator
        assert!(tx_context::sender(ctx) == payment.creator, E_NOT_AUTHORIZED);
        
        // Ensure payment is active
        assert!(payment.status == ACTIVE, E_PAYMENT_CLOSED);
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(value(&coin_in) >= amount, E_INSUFFICIENT_BALANCE);

        // Extract the amount needed
        let additional_coin = split(&mut coin_in, amount, ctx);
        let additional_balance = into_balance(additional_coin);
        
        // Add to existing balance
        balance::join(&mut payment.balance, additional_balance);
        
        // Return remainder if any
        if (value(&coin_in) > 0) {
            public_transfer(coin_in, tx_context::sender(ctx));
        } else {
            destroy_zero(coin_in);
        };
    }

    // Check if payment is due at a specific timestamp
    public fun is_payment_due(
        payment: &Payment,
        timestamp: u64
    ): bool {
        payment.status == ACTIVE && timestamp >= payment.next_payment_due
    }

    // Check if a specific payment was executed
    public fun was_payment_executed(
        payment: &Payment,
        timestamp: u64
    ): bool {
        assert!(table::contains(&payment.payments, timestamp), E_NO_PAYMENT_DUE);
        *table::borrow(&payment.payments, timestamp)
    }

    // Get payment details - public view function
    public fun get_payment_details(payment: &Payment): (
        address, address, u64, u8, u8, u64, u64, u64
    ) {
        (
            payment.creator,
            payment.recipient,
            payment.amount,
            payment.payment_type,
            payment.status,
            payment.start_timestamp,
            payment.interval,
            payment.next_payment_due
        )
    }
} 