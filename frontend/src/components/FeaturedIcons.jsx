import React from 'react';
import { Link } from 'react-router-dom';
import {
    Car,
    Wrench,
    Droplets,
    Battery,
    Disc,
    ShieldCheck,
    Cog,
    Zap,
    SprayCan
} from 'lucide-react';

const categories = [
    { name: 'Engine', icon: Cog, query: 'Engine' },
    { name: 'Brakes', icon: Disc, query: 'Brakes' },
    { name: 'Suspension', icon: Car, query: 'Suspension' },
    { name: 'Ignition', icon: Zap, query: 'Ignition' },
    { name: 'Electrical', icon: Battery, query: 'Electrical' },
    { name: 'Body', icon: ShieldCheck, query: 'Body' },
    { name: 'Wheels', icon: Car, query: 'Wheels' },
    { name: 'Auto Detailing', icon: SprayCan, query: 'Autodetailing' }, // Mapping to "Autodetailing"
    { name: 'Engine Oil', icon: Droplets, query: 'Engine' }, // Maybe map to Engine or create new? Let's map to Engine for now or just pass "Engine Oil" if it exists in data
    { name: 'Filters', icon: Wrench, query: 'Filters' },
];

const FeaturedIcons = () => {
    return (
        <div className="my-10">
            <div className="text-center py-8 text-3xl">
                <h2 className="text-3xl font-medium text-gray-900 uppercase">Featured Categories</h2>
                <div className="w-20 h-[2px] bg-gray-700 mx-auto mt-2"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-0">
                {categories.map((cat, index) => (
                    <Link
                        to={`/collection?category=${cat.query}`}
                        key={index}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-orange-500 transition-all cursor-pointer group"
                    >
                        <div className="bg-orange-50 p-4 rounded-full mb-3 group-hover:bg-orange-100 transition-colors">
                            <cat.icon className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">{cat.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FeaturedIcons;
