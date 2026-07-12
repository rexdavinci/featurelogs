import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "pricing-table-id": string | undefined;
        "publishable-key": string | undefined;
        "customer-email": string | null | undefined;
      };
    }
  }
}
