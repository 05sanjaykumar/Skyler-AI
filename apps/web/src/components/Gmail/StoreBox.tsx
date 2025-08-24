// apps/web/src/components/main/StoreBox.tsx
import React from 'react'
import { Email } from "@/../types/email";

const StoreBox = ({
  onSelect,
  instance
}: {
  onSelect: (email: Email) => void;
  instance: any;
}) => {
  return (
    <div>
      <h2>Store</h2>
      <p>Coming soon.</p>
    </div>
  )
}

export default StoreBox
