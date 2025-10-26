import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface BalanceCardProps {
  balance: number;
  usdRate: number | null;
  isLoading: boolean;
  onSendClick: () => void;
  onReceiveClick: () => void;
}

const SendIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);
const ReceiveIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);

const SkeletonBalanceCard: React.FC = () => (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
        <SkeletonLoader className="h-6 w-1/3 mx-auto mb-2" />
        <SkeletonLoader className="h-12 w-3/4 mx-auto mb-3" />
        <SkeletonLoader className="h-7 w-1/2 mx-auto mb-6" />
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <SkeletonLoader className="h-12 w-full sm:w-32 rounded-lg" />
            <SkeletonLoader className="h-12 w-full sm:w-32 rounded-lg" />
        </div>
    </div>
);


const BalanceCard: React.FC<BalanceCardProps> = ({ balance, usdRate, isLoading, onSendClick, onReceiveClick }) => {
    if (isLoading) {
        return <SkeletonBalanceCard />;
    }

    const balanceInUsd = usdRate ? balance * usdRate : null;

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
            <p className="text-sm font-medium text-gray-400 mb-1">Total Balance</p>
            <div className="text-5xl font-bold text-white tracking-tight">
                {balance.toFixed(8)}
                <span className="text-3xl font-medium text-gray-400 ml-2">BTC</span>
            </div>
            {balanceInUsd !== null ? (
                 <p className="text-lg text-gray-300 mt-1 h-7">
                    ≈ ${balanceInUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                 </p>
            ) : (
                <div className="h-7 mt-1" /> // Placeholder for layout stability
            )}
           
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                 <button 
                    onClick={onSendClick} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                 >
                    <SendIcon />
                    <span>Send</span>
                </button>
                 <button 
                    onClick={onReceiveClick} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                 >
                    <ReceiveIcon />
                    <span>Receive</span>
                </button>
            </div>
        </div>
    );
};

export default BalanceCard;