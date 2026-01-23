"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Plus, Trash2, ShoppingBag, Store } from "lucide-react";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type ProductType = "retail" | "salon_use";

export default function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ProductType>("retail");

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [link, setLink] = useState("");
    const [image, setImage] = useState("");
    const [type, setType] = useState<ProductType>("retail");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = onSnapshot(collection(db, "users", user.uid, "products"), (snap) => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "users", user.uid, "products"), {
                name, brand, description,
                price: type === 'retail' ? parseFloat(price) : null,
                purchaseLink: link,
                image, type,
                createdAt: new Date()
            });
            toast.success("Product added");
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error("Failed to add product");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!user || !confirm("Delete this product?")) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "products", id));
            toast.success("Product deleted");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const resetForm = () => {
        setName(""); setBrand(""); setDescription(""); setPrice(""); setLink(""); setImage("");
    };

    const filteredProducts = products.filter(p => p.type === activeTab);

    if (loading) return <div>Loading products...</div>;

    return (
        <div className="space-y-8 min-h-screen pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products & Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage retail items and salon supplies.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#6F2DBD] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#5a2499] transition-all shadow-lg hover:shadow-[#6F2DBD]/30"
                >
                    <Plus className="w-5 h-5" /> Add Product
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("retail")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'retail' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ShoppingBag className="w-4 h-4" /> For Sale (Retail)
                </button>
                <button
                    onClick={() => setActiveTab("salon_use")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'salon_use' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Store className="w-4 h-4" /> Used in Salon
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md transition-shadow relative">
                        <button
                            onClick={() => handleDelete(product.id)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image || "https://source.unsplash.com/random/300x300/?product"} alt={product.name} className="w-full h-full object-cover" />
                            {product.type === 'retail' && (
                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    ${product.price}
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{product.brand}</div>
                        <h3 className="font-bold text-gray-900 leading-tight mb-2 truncate">{product.name}</h3>
                        {product.purchaseLink && (
                            <a href={product.purchaseLink} target="_blank" className="text-xs text-[#6F2DBD] hover:underline block truncate">
                                {product.purchaseLink}
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-bold mb-6">Add Product</h2>
                            <form onSubmit={handleAddProduct} className="space-y-6">
                                <div className="flex justify-center">
                                    <ImageUploader
                                        directory="products"
                                        onUpload={(url) => setImage(url)}
                                        onRemove={() => setImage("")}
                                        currentImage={image}
                                        variant="square"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-sm font-bold text-gray-700 block mb-2">Product Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={type === 'retail'} onChange={() => setType('retail')} name="type" className="text-[#6F2DBD]" />
                                                <span className="text-sm font-medium">Retail (For Sale)</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={type === 'salon_use'} onChange={() => setType('salon_use')} name="type" className="text-[#6F2DBD]" />
                                                <span className="text-sm font-medium">Salon Use</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Name</label>
                                        <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Brand</label>
                                        <input required value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                    </div>
                                </div>

                                {type === 'retail' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Price ($)</label>
                                            <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Buy Link (Optional)</label>
                                            <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6F2DBD] outline-none min-h-[80px]" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#6F2DBD] text-white rounded-xl font-bold hover:bg-[#5a2499] transition-colors">
                                    {isSubmitting ? "Adding..." : "Add Product"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
