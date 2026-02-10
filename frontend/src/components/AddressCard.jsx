const AddressCard = ({ address, isDefault }) => {
  return (
    <div className="relative border border-gray-200 p-6 bg-white hover:border-orange-600 transition-all group cursor-pointer">
      {/* Visual Indicator like a parts label */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gray-100 group-hover:bg-orange-600 transition-all" />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase">
            {isDefault ? "Primary Hub" : "Secondary Location"}
          </span>
          <h3 className="text-lg font-bold uppercase tracking-tight">{address.fullName}</h3>
        </div>
        <div className="flex gap-3 text-xs font-bold text-gray-400">
<button onClick={() => onEdit(address)} className="hover:text-black transition-colors">EDIT</button>
  <button onClick={() => onRemove(address._id)} className="hover:text-red-600 transition-colors">REMOVE</button>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-600 font-light">
        <p>{address.street}</p>
        <p>{address.city}, {address.state} {address.zipCode}</p>
        <p className="pt-2 text-black font-medium">{address.phone}</p>
      </div>
    </div>
  );
};