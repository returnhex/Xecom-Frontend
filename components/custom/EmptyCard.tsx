import React from "react";

const EmptyCard = () => {
  return (
    <div className="col-span-full py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div className="from-secondary to-background relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
          <svg
            className="text-muted-foreground h-10 w-10 animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 3h2v4H3V3zm4 0h2v4H7V3zm4 0h2v4h-2V3zm4 0h2v4h-2V3zM3 10h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" />
          </svg>
        </div>
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">No products available</h3>
      <p className="text-muted-foreground mx-auto max-w-xs text-sm">
        Looks like this collection is currently empty. Try a different filter or come back soon!
      </p>
    </div>
  );
};

export default EmptyCard;
