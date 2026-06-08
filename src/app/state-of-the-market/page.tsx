import type { Metadata } from "next";
import { StateOfMarketClient } from "./StateOfMarketClient";

export const metadata: Metadata = {
  title: "State of the Market — Weekly Cannabis Intelligence",
  description:
    "Weekly intelligence reports on Michigan cannabis: hottest products, trusted brands, boof alerts, and market movement.",
};

export default function StateOfMarketPage() {
  return <StateOfMarketClient />;
}
