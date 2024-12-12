"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/user-context";
import { toast } from "sonner";
import axios from "axios";
import { useSubscription } from "@/hooks/userSubscription";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const pricingData = [
  {
    title: "Launch",
    price: "$240/month",
    description: "1000 Leads contacted per month\nApprox. 3000 emails",
    features: [
      "All Core Sally-AgentProd features",
      "CRM Integrations",
      "Email Warmup",
      "1-1 White Glove Human Onboarding",
      "Premium Support",
    ],
    heightlight: true,
    buttonText: "$240",
    prices: "240",
    additionalInfo: "$40 per additional 100 leads",
  },
  {
    title: "Custom",
    price: "Custom",
    description: "For B2B Sales Teams with 5+ Seats\nUnlimited emails",
    features: [
      "Custom Email Playbook",
      "Training on your Data",
      "Custom Feature Development",
      "Domain + Email Setup",
      "Dedicated Account Manager",
      "Direct Slack Connection",
    ],
    buttonText: "Talk To Sales",
    additionalInfo: "",
  },
];

function PriceCard({
  onClose,
  onCheckoutComplete,
}: {
  onClose: () => void;
  onCheckoutComplete: () => void;
}) {
  const { user } = useUserContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const { fetchSubscriptionStatus } = useSubscription();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => toast.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleCheckout(price: number, title: string) {
    if (!isRazorpayReady) {
      toast.error("Razorpay SDK is not ready");
      return;
    }
    setIsProcessing(true);
    onClose();
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price * 100,
          currency: "USD",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();

      const options = {
        key: "rzp_live_v0sNIuiCIceCva",
        amount: price * 100,
        currency: "USD",
        name: "AGENTPROD VENTURES PRIVATE LIMITED",
        description: `Plan: ${title}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URL}v2/pricing-plans/`,
            {
              user_id: user.id,
              subscription_mode: "Razorpay",
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              amount: price.toString(),
              email: user.email,
              start_time: new Date().toISOString(),
              subscribed: true,
            }
          );
          toast.success("Payment Successful!");
          console.log(response);
          await fetchSubscriptionStatus();
          onCheckoutComplete();
        },
        prefill: {
          name: user.firstName,
          email: user?.email || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("Checkout form closed");
            onCheckoutComplete();
          },
          animation: false,
          width: "500px",
          height: "600px",
        },
        payment_methods: {
          card: true,
          netbanking: true,
          wallet: true,
          upi: true,
        },
        notes: {
          plan_name: title,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed. Please try again.");
        onCheckoutComplete();
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Something went wrong during the checkout.");
      onCheckoutComplete();
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <DialogHeader>
        <DialogTitle className="text-3xl">Pricing Plans</DialogTitle>
        <DialogDescription>
          Select a plan that suits your needs.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricingData.map((card, index) => (
          <div
            key={index}
            className={`rounded-3xl p-6 shadow-lg flex flex-col justify-between ${
              card.heightlight
                ? "border-[#732e53] border-2 bg-gradient-to-b from-[#732e53]/30 via-white/15 via-20% to-black"
                : "border-white/30 border bg-gradient-to-b from-black via-white/15 via-20% to-black"
            } bg-black text-white`}
          >
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold mb-4">{card.title}</h3>
              <p className="mb-4 whitespace-pre-line">{card.description}</p>
              <p className="text-3xl my-12 font-mono font-thin text-center">
                {card.price}
              </p>
              <ul className="mb-4 space-y-2">
                {card.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-14">
              <Button
                onClick={() => handleCheckout(Number(card.prices), card.title)}
                disabled={isProcessing || card.title === "Custom"}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition duration-500 py-5 px-4 rounded-full w-full"
              >
                {isProcessing ? "Processing..." : card.buttonText}
              </Button>
              {card.additionalInfo && (
                <p className="mt-4 text-sm text-gray-400">
                  {card.additionalInfo}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PriceCard;
