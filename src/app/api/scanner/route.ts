import { NextRequest, NextResponse } from 'next/server';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { checkRateLimit } from '@/lib/utils/rateLimiter';
import { saveReceipt } from '@/lib/firebase/firestore';
import { analyzeReceipt } from '@/lib/gemini/scanner';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/utils/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCAN_DAILY_LIMIT = 5;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const uid = formData.get('uid') as string | null;

    // Input validation
    if (!uid || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: uid and image' },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPEG, PNG, or WebP.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5 MB.' },
        { status: 400 },
      );
    }

    // Rate limit
    const allowed = await checkRateLimit(uid, 'scan', SCAN_DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily scan limit reached (5/day). Try again tomorrow!' },
        { status: 429 },
      );
    }

    // Convert file to buffer and base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Upload to Firebase Storage
    const timestamp = Date.now();
    const path = `receipts/${uid}/${timestamp}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, buffer, { contentType: file.type });
    const downloadUrl = await getDownloadURL(fileRef);

    // Analyze with Gemini Vision
    const analysis = await analyzeReceipt(base64, file.type);

    if (!analysis) {
      return NextResponse.json(
        { error: "That doesn't look like a receipt. Please upload a shopping bill or grocery receipt." },
        { status: 422 },
      );
    }

    // Persist result
    await saveReceipt({
      uid,
      imageUrl: downloadUrl,
      analysis,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ analysis, imageUrl: downloadUrl });
  } catch (err) {
    return NextResponse.json(
      { error: 'Scanner temporarily unavailable. Please try again.' },
      { status: 500 },
    );
  }
}
