import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // --- NEW PROFILE FIELDS ---
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    addresses: [
        {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String },
            isDefault: { type: Boolean, default: false }
        }
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;