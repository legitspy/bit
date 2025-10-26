import React, { useState, useEffect } from 'react';
import type { UserProfile, Transaction } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getTransactions } from '../services/apiService';
import Header from './Header';
import BalanceCard from './BalanceCard';
import TransactionList from './TransactionList';
import ReceiveModal from './ReceiveModal';
import SendModal from './SendModal';
import BottomNavBar from './BottomNavBar';
import GeminiInsights from './GeminiInsights';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState('');
  const [isReceiveModalOpen, setReceiveModalOpen] = useState(false);
  const [isSendModalOpen, setSendModalOpen] = useState(false);
  const [btcToUsdRate, setBtcToUsdRate] = useState<number | null>(null);
  
  const walletAddress = "37T14ky2anWmM3GyaLEMER8fxyLhcGUKAY";
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null | 'error'>(null);
  
  const isLoading = !profile || !transactions;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        setError('');
        const [userProfile, userTransactions] = await Promise.all([
          getUserProfile(user.email),
          getTransactions(user.email),
        ]);
        setProfile(userProfile);
        setTransactions(userTransactions);
      } catch (apiError: any) {
        setError(apiError.message || "Failed to fetch dashboard data.");
      }
    };
    
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        if (!response.ok) throw new Error('Failed to fetch price');
        const data = await response.json();
        setBtcToUsdRate(data.bitcoin.usd);
      } catch (e) {
        console.error("Could not fetch BTC price, using fallback:", e);
        setBtcToUsdRate(65000); // Fallback rate
      }
    };

    fetchData();
    fetchBtcPrice();
  }, [user]);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=bitcoin:${walletAddress}&qzone=1&margin=0`;
        const response = await fetch(qrCodeUrl);
        if (!response.ok) throw new Error('Failed to fetch QR code');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setQrCodeDataUrl(reader.result as string);
        reader.onerror = () => {
            console.error("Error reading QR code blob");
            setQrCodeDataUrl('error');
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Could not pre-fetch QR code:", e);
        setQrCodeDataUrl('error');
      }
    };
    fetchQrCode();
  }, [walletAddress]);

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="safe-main-padding-bottom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BalanceCard
          balance={profile?.balance ?? 0}
          usdRate={btcToUsdRate}
          isLoading={isLoading}
          onSendClick={() => setSendModalOpen(true)}
          onReceiveClick={() => setReceiveModalOpen(true)}
        />
        
        <div className="mt-8">
          <TransactionList transactions={transactions} isLoading={isLoading} />
        </div>
        
        <div className="mt-8">
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            <GeminiInsights transactions={transactions} />
          </div>
        </div>

      </main>

      {isReceiveModalOpen && (
        <ReceiveModal 
            address={walletAddress} 
            onClose={() => setReceiveModalOpen(false)} 
            qrCodeDataUrl={qrCodeDataUrl}
        />
      )}
      {isSendModalOpen && (
        <SendModal 
            balance={profile?.balance ?? 0} 
            onClose={() => setSendModalOpen(false)} 
            walletAddress={walletAddress}
        />
      )}

      <div className="lg:hidden">
        <BottomNavBar 
            onSendClick={() => setSendModalOpen(true)}
            onReceiveClick={() => setReceiveModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default Dashboard;