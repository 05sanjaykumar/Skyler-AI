// apps/web/src/components/main/EmailsDetails.tsx
export default function EmailDetail({ email }: { email: { subject: string; body: string } }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">{email.subject}</h2>
      <p className="mt-2 whitespace-pre-wrap">{email.body}</p>
    </div>
  );
}
