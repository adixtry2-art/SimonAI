import { X, Check, Crown, Zap, Star, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'amazon' | 'xbox' | 'paypal' | null;

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [amazonCode, setAmazonCode] = useState('');
  const [xboxCode, setXboxCode] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free',
      price: '0',
      icon: Star,
      color: 'slate',
      features: [
        '1 foto in input al giorno',
        '1 creazione in output al giorno',
        'Risposte base',
        'Limitazioni sui token',
        'Accesso standard alle funzionalità'
      ],
      limitations: true
    },
    {
      name: 'Core',
      price: '5.99',
      icon: Zap,
      color: 'blue',
      popular: true,
      features: [
        '15 foto in input al giorno',
        '15 creazioni in output al giorno',
        '1 milione di token giornalieri',
        'Risposte prioritarie',
        'Nessuna pubblicità',
        'Supporto via email'
      ]
    },
    {
      name: 'Pro',
      price: '11.99',
      icon: Crown,
      color: 'purple',
      features: [
        '30 foto in input al giorno',
        '30 creazioni in output al giorno',
        '2 milioni di token giornalieri',
        'Risposte istantanee prioritarie',
        'Accesso anticipato alle novità',
        'Supporto prioritario 24/7',
        'Funzionalità esclusive'
      ]
    }
  ];

  const handlePlanClick = (planName: string) => {
    if (planName === 'Free') return;
    setSelectedPlan(planName);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setPaymentMethod(null);
    setAmazonCode('');
    setXboxCode('');
    setPaypalEmail('');
    setPaypalPassword('');
  };

  const handlePayment = () => {
    alert('Pagamento elaborato! (Questa è una demo)');
    onClose();
  };

  if (selectedPlan) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-[#0F2035] rounded-2xl max-w-md w-full shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-2xl font-semibold text-white">Metodo di pagamento</h2>
              <p className="text-slate-400 text-sm mt-1">Piano {selectedPlan}</p>
            </div>
            <button
              onClick={handleBackToPlans}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('amazon')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'amazon'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-[#1C2E45] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-orange-500" />
                  <span className="text-white font-medium">Card Amazon</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('xbox')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'xbox'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-[#1C2E45] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-green-500" />
                  <span className="text-white font-medium">Card Xbox</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-[#1C2E45] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <span className="text-white font-medium">PayPal</span>
                </div>
              </button>
            </div>

            {paymentMethod === 'amazon' && (
              <div className="mt-6 space-y-3">
                <label className="block text-slate-300 text-sm font-medium">
                  Inserisci codice
                </label>
                <input
                  type="text"
                  value={amazonCode}
                  onChange={(e) => setAmazonCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 bg-[#1C2E45] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {paymentMethod === 'xbox' && (
              <div className="mt-6 space-y-3">
                <label className="block text-slate-300 text-sm font-medium">
                  Inserisci codice Xbox
                </label>
                <input
                  type="text"
                  value={xboxCode}
                  onChange={(e) => setXboxCode(e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className="w-full px-4 py-3 bg-[#1C2E45] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="mt-6 space-y-3">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Email PayPal
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="email@esempio.com"
                    className="w-full px-4 py-3 bg-[#1C2E45] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Password PayPal
                  </label>
                  <input
                    type="password"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#1C2E45] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod && (
              <button
                onClick={handlePayment}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                Completa pagamento
              </button>
            )}

            <div className="mt-6 p-4 bg-[#1C2E45] rounded-xl border border-slate-700">
              <p className="text-slate-300 text-sm text-center">
                Ti servono più funzioni? Opta per l'abbonamento adatto a te!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F2035] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">Scegli il tuo piano</h2>
            <p className="text-slate-400 text-sm mt-1">Sblocca tutto il potenziale di SimonAI</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.name}
                  className={`relative bg-[#1C2E45] rounded-2xl border-2 ${
                    isPopular ? 'border-blue-500' : 'border-slate-700'
                  } p-6 flex flex-col transition-all hover:scale-105 hover:shadow-xl`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Più popolare
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex w-14 h-14 items-center justify-center rounded-2xl mb-4 ${
                      plan.color === 'blue' ? 'bg-blue-600/20' :
                      plan.color === 'purple' ? 'bg-purple-600/20' : 'bg-slate-600/20'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        plan.color === 'blue' ? 'text-blue-500' :
                        plan.color === 'purple' ? 'text-purple-500' : 'text-slate-400'
                      }`} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white">€{plan.price}</span>
                      {plan.price !== '0' && <span className="text-slate-400">/mese</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 ${
                          plan.color === 'blue' ? 'text-blue-500' :
                          plan.color === 'purple' ? 'text-purple-500' : 'text-slate-400'
                        }`} />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={plan.price === '0'}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.price === '0'
                        ? 'bg-slate-700 text-white cursor-default'
                        : isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : plan.color === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.price === '0' ? 'Piano attuale' : 'Passa a ' + plan.name}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-[#1C2E45] rounded-xl border border-slate-700">
            <p className="text-slate-300 text-sm text-center">
              Ti servono più funzioni? Opta per l'abbonamento adatto a te!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
