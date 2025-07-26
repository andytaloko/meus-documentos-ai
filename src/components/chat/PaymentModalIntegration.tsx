import { useChatBot } from "@/contexts/ChatBotContext";
import PaymentModal from "@/components/PaymentModal";

export function PaymentModalIntegration() {
  const { 
    showPaymentModal, 
    setShowPaymentModal, 
    conversationData,
    selectedService 
  } = useChatBot();

  if (!selectedService || !conversationData.orderId) {
    return null;
  }

  return (
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      serviceId={selectedService.id}
      serviceName={selectedService.name}
      amount={conversationData.totalAmount || selectedService.base_price}
      customerData={{
        name: conversationData.customerName,
        email: conversationData.customerEmail,
        phone: conversationData.customerPhone,
        cpf: conversationData.customerCPF
      }}
    />
  );
}