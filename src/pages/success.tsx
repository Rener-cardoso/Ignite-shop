import { stripe } from "@/lib/stripe";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import Stripe from "stripe";

interface SuccessProps {
  customerName: string;
  product: {
    name: string;
    imageUrl: string;
  }
}

export default function Success({ customerName, product }: SuccessProps) {
  return (
    <main className="flex flex-col items-center justify-center my-0 mx-auto h-[656px]">
      <h1 className="text-[2rem] text-gray100">
        Compra efetuada!
      </h1>

      <div className="w-full max-w-[130px] h-36 bg-gradient-to-t from-[#7465d4] to-[#1ea483] rounded-lg p-1 flex items-center justify-center mt-16">
        <Image src={product.imageUrl} width={120} height={110} alt="" />
      </div>

      <p className="text-2xl text-gray300 max-w-[560px] text-center mt-8">
        Uhuul <strong>{customerName}</strong>, sua <strong>{product.name}</strong> já está a caminho da sua casa.
      </p>
    
      <Link className="mt-20 text-xl font-bold text-green500 hover:text-green300" href="/">
        Voltar ao catálogo
      </Link>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query, params }) => {
  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']
  })
  
  const customerName = session.customer_details.name;
  const product = session.line_items.data[0].price.product as Stripe.Product;

  return {
    props: {
      customerName,
      product: {
        name: product.name,
        imageUrl: product.images[0]
      }
    }
  }
}