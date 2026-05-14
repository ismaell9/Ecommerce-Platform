import CartLoader from '@/assets/Shopping Cart Loader.webm'

export function FloatingCartAnimation() {
  return (
    <>
      <div
        className="pointer-events-none fixed bottom-1 left-[-160px] z-20"
        style={{
          animation: 'cart-fade-in 0.8s ease forwards 0.3s, cart-travel 18s linear infinite',
          willChange: 'transform, opacity',
        }}
      >
        <video
          src={CartLoader}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] lg:w-[70px] lg:h-[70px] object-contain"
          style={{
            animation: 'cart-bob 4s ease-in-out infinite',
            willChange: 'transform',
          }}
        />
      </div>
      <style>{`
        @keyframes cart-travel {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw + 260px));
          }
        }

        @keyframes cart-bob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes cart-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
