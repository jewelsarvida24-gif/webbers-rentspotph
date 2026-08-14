'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase_client';

const DOCUMENT_TYPES = [
  { value: 'government_id', label: 'Government-issued ID' },
  { value: 'selfie_with_id', label: 'Selfie with ID' },
  { value: 'drivers_license', label: 'Driver’s License' },
  { value: 'other', label: 'Other Document' },
];

interface Props {
  onUploadSuccess?: () => void;
}

export default function KYCUploadForm({ onUploadSuccess }: Props) {
  const supabase = createClient();
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0].value);
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSuccess(null);
    setError(null);
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const sanitize = (text: string) => text.replace(/[^a-zA-Z0-9.-_]/g, '_');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }

    if (!expiryDate) {
      setError('Please enter the document expiry date.');
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Unable to identify your account. Please sign in again.');
      setLoading(false);
      return;
    }

    const uploadPath = `kyc/${user.id}/${Date.now()}-${sanitize(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(uploadPath, file);

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const publicUrlResponse = await supabase.storage
      .from('kyc-documents')
      .getPublicUrl(uploadPath);

    if (!publicUrlResponse.data?.publicUrl) {
      setError('Uploaded file, but failed to generate a preview link.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('tbl_kyc').insert({
      user_id: user.id,
      document_type: documentType,
      file_url: publicUrlResponse.data.publicUrl,
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      expiry_date: expiryDate,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess('Your document has been uploaded and is pending review.');
    setFile(null);
    setExpiryDate('');
    setDocumentType(DOCUMENT_TYPES[0].value);
    event.currentTarget.reset();
    onUploadSuccess?.();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{success}</div>}

      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-neutral-700 mb-1">
          Document type
        </label>
        <select
          id="documentType"
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          className="input-field"
        >
          {DOCUMENT_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700 mb-1">
          Document expiry date
        </label>
        <input
          id="expiryDate"
          type="date"
          value={expiryDate}
          onChange={(event) => setExpiryDate(event.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="kycFile" className="block text-sm font-medium text-neutral-700 mb-1">
          Upload document (PNG, JPEG, PDF)
        </label>
        <input
          id="kycFile"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="w-full text-sm text-neutral-700"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Uploading…' : 'Submit for review'}
      </button>

      <p className="text-sm text-neutral-500">
        Note: KYC documents are reviewed by the RentSpotPH team. Once approved, you can complete bookings.
      </p>
    </form>
  );
}
