import { stripe } from "@/lib/stripe";
import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useState } from "react";
import Stripe from "stripe";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);


  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl
    } catch (err) {

      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <main className="grid grid-cols-2 items-stretch gap-16 max-w-[1180px] my-0 mx-auto">
      <div className="w-full max-w-xl h-[656px] bg-gradient-to-t from-[#7465d4] to-[#1ea483] rounded-lg p-1 flex items-center justify-center">
        <Image src={product.imageUrl} alt="" width={520} height={480} />
      </div>

      <div className="flex flex-col">
        <h1 className="text-[2rem] text-gray300">{product.name}</h1>
        <span className="mt-4 block text-[2rem] text-green300">{product.price}</span>
        <p className="mt-10 text-lg text-gray300">{product.description}</p>
      
        <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct} className="mt-auto bg-green500 hover:bg-green300 text-white rounded-lg p-5 font-bold text-lg disabled:opacity-75">
          Comprar agora
        </button>
      </div>
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const productId = String(params.id);

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });

  const price = product.default_price as Stripe.Price
  
  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price.unit_amount / 100),
      description: product.description,
      defaultPriceId: price.id,
     }
    },
    revalidate: 60 * 60 * 1,
  }
}