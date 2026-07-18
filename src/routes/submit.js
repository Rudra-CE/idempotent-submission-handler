const express = require('express');
const router = express.Router();
const redis = require('../redisClient');

// How long to remember a request (from .env, default 60 seconds)
const TTL = parseInt(process.env.TTL_SECONDS) || 60;

/**
 * POST /submit
 *
 * This endpoint handles form/data submissions safely.
 * If the same Idempotency-Key is sent twice within the TTL window,
 * the second request gets the cached result without reprocessing.
 *
 * Required Header: Idempotency-Key: <unique-string>
 * Body: any JSON payload
 */
router.post('/', async (req, res) => {
    // Step 1: Read the Idempotency-Key from the request header
    const idempotencyKey = req.headers['idempotency-key'];

    // Step 2: If no key is provided, reject the request
    if (!idempotencyKey) {
        return res.status(400).json({
            error: 'Idempotency-Key header is required.',
            hint: 'Add a header like: Idempotency-Key: my-unique-request-id',
        });
    }

    // Use a prefix to keep our keys organized in Redis
    const redisKey = `idempotency:${idempotencyKey}`;

    try {
        // Step 3: Check Redis — has this key been seen before?
        const cached = await redis.get(redisKey);

        if (cached) {
            // Step 4: KEY EXISTS — return the cached response (do NOT reprocess)
            console.log(`⚡ Cache HIT for key: ${idempotencyKey} — returning cached result`);
            const cachedData = JSON.parse(cached);
            return res.status(200).json({
                ...cachedData,
                cached: true, // tells the caller this was a duplicate
            });
        }

        // Step 5: KEY DOES NOT EXIST — process the request fresh
        console.log(`🆕 Cache MISS for key: ${idempotencyKey} — processing fresh`);

        // --- YOUR BUSINESS LOGIC GOES HERE ---
        // In a real app, this is where you would:
        //   - Save to a database
        //   - Charge a payment
        //   - Send an email
        // For this demo, we simulate that with a fake result:
        const submissionResult = {
            status: 'processed',
            submittedData: req.body,
            processedAt: new Date().toISOString(),
            transactionId: `txn_${Date.now()}`,
        };
        // --- END OF BUSINESS LOGIC ---

        // Step 6: Store the result in Redis
        // SET key value NX EX <seconds>
        //   NX = only set if Not eXists (safety net — prevents race conditions)
        //   EX = expire after TTL seconds
        await redis.set(redisKey, JSON.stringify(submissionResult), 'EX', TTL);

        console.log(`💾 Result stored in Redis for ${TTL} seconds`);

        // Step 7: Return the fresh result
        return res.status(201).json({
            ...submissionResult,
            cached: false, // tells the caller this was a fresh process
        });

    } catch (err) {
        console.error('❌ Server error:', err.message);
        return res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
});

module.exports = router;
