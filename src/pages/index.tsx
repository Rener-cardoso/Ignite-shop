import Image from "next/image";
import Link from "next/link";

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { stripe } from "@/lib/stripe";
import { GetStaticProps } from "next";
import Stripe from "stripe";


interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[]
}

export default function Home({ products }: HomeProps) {

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48
    }
  })

  return (
    <main ref={sliderRef} className="keen-slider flex max-w-[calc(100vw - ((100vw - 1180px)/2))] ml-auto min-h-[656px]">
      {
        products.map(product => {
          return (
            <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
              <div className="keen-slider__slide group bg-gradient-to-t from-[#7465d4] to-[#1ea483] rounded-lg p-1 relative flex items-center justify-center">
                <Image src={product.imageUrl} alt="" width={520} height={480} className="object-cover" />
        
                <footer className="absolute bottom-1 left-1 right-1 rounded-md flex items-center justify-between bg-gray900 bg-opacity-60 p-8 translate-y-[110%] opacity-0 transition-all ease-in-out duration-200 group-hover:translate-y-[0%] group-hover:opacity-100">
                  <strong className="text-lg">{product.name}</strong>
                  <span className="text-xl font-bold text-green300">{product.price}</span>
                </footer>
              </div>
            </Link>
          )
        })
      }
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  })

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price.unit_amount / 100),
    }
  })

  return {
    props: {
      products
    },
    revalidate: 60 * 60 * 2,
  }
}