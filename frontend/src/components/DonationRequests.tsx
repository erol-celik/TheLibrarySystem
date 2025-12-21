import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Gift, Loader2, Book, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { DonationService, DonationRequest } from '../services/DonationService';

export function DonationRequests() {
    const [donations, setDonations] = useState<DonationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchDonations = async () => {
        try {
            const data = await DonationService.getPendingDonations();
            setDonations(data);
        } catch (error) {
            console.error('Error fetching donations:', error);
            toast.error('Failed to load donation requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handleProcess = async (id: string, approved: boolean) => {
        setProcessingId(id);
        try {
            await DonationService.processDonation(id, approved);
            toast.success(`Donation ${approved ? 'approved' : 'rejected'} successfully.`);
            // Refresh list
            setDonations(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error processing donation:', error);
            toast.error('Failed to process donation.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-20 min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-[#00A67E]" />
                <p className="text-gray-500 mt-4 animate-pulse font-medium">Loading pending requests...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <Gift className="w-7 h-7 text-[#00A67E]" />
                        Donation Requests
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Review and manage incoming book donations from users.
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800">
                    <span className="text-green-700 dark:text-green-400 font-semibold text-sm">
                        {donations.length} Pending
                    </span>
                </div>
            </div>

            {donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                        <Gift className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Pending Donations</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Great job! You've processed all the donation requests for now. Check back later for new contributions.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {donations.map((donation) => (
                        <div
                            key={donation.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-green-100 dark:hover:border-green-900/50 group"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                {/* Left Side: Book Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 border border-orange-100 dark:border-orange-900/30">
                                                    <Clock className="w-3 h-3" /> Pending Review
                                                </span>
                                                <span className="text-gray-400 text-xs font-mono">
                                                    #{donation.id}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#00A67E] transition-colors flex items-center gap-2">
                                                <Book className="w-5 h-5 text-gray-400 group-hover:text-[#00A67E]" />
                                                {donation.bookTitle}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium ml-7">
                                                By {donation.bookAuthor}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white dark:bg-gray-600 p-1.5 rounded-full shadow-sm">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <span>Donor: <span className="text-gray-900 dark:text-white font-medium">{donation.username || 'Anonymous'}</span></span>
                                        </div>
                                        <div className="hidden md:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white dark:bg-gray-600 p-1.5 rounded-full shadow-sm">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </div>
                                            <span>Requested: <span className="text-gray-900 dark:text-white font-medium">{donation.requestDate || 'Recently'}</span></span>
                                        </div>
                                    </div>

                                    {donation.description && donation.description !== 'No description provided' && (
                                        <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                                "{donation.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex flex-row md:flex-col gap-3 md:min-w-[140px] pt-2">
                                    <button
                                        onClick={() => handleProcess(donation.id, true)}
                                        disabled={processingId === donation.id}
                                        className="flex-1 bg-[#00A67E] text-white px-4 py-3 rounded-xl hover:bg-[#008f6d] transition-all flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {processingId === donation.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleProcess(donation.id, false)}
                                        disabled={processingId === donation.id}
                                        className="flex-1 bg-white text-red-600 border border-red-100 px-4 py-3 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 font-semibold hover:shadow-sm hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10 disabled:hover:translate-y-0"
                                    >
                                        {processingId === donation.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
