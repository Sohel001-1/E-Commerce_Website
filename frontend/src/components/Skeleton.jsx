import React from "react";

export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-square rounded-2xl skeleton-pulse" />
    <div className="pt-3 space-y-2">
      <div className="h-3 w-3/4 rounded-full skeleton-pulse" />
      <div className="h-3 w-1/3 rounded-full skeleton-pulse" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 5, cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" }) => (
  <div className={`grid ${cols} gap-4 gap-y-6`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
  <div className={`${width} ${height} rounded-full skeleton-pulse`} />
);

export const SkeletonProductDetail = () => (
  <div className="animate-pulse pt-10">
    <div className="flex gap-12 flex-col sm:flex-row">
      <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
        <div className="flex sm:flex-col gap-2 sm:w-[18.7%]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl skeleton-pulse" />
          ))}
        </div>
        <div className="w-full sm:w-[80%] aspect-square rounded-2xl skeleton-pulse" />
      </div>
      <div className="flex-1 space-y-4">
        <SkeletonLine width="w-3/4" height="h-7" />
        <SkeletonLine width="w-1/4" height="h-8" />
        <div className="space-y-2 mt-6">
          <SkeletonLine />
          <SkeletonLine width="w-5/6" />
          <SkeletonLine width="w-2/3" />
        </div>
        <div className="mt-8">
          <div className="w-40 h-12 rounded-xl skeleton-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonHero = () => (
  <div className="animate-pulse w-full">
    <div className="h-[400px] md:h-[550px] rounded-2xl skeleton-pulse" />
  </div>
);
