import { useWindowSize } from "@uidotdev/usehooks";
import ConfettiBase from "react-confetti";
import { createPortal } from "react-dom";

export default function Confetti() {
  const { width, height } = useWindowSize();
  return createPortal(
    <ConfettiBase
      width={width ?? 0}
      height={height ?? 0}
      recycle={false}
      gravity={0.2}
      tweenDuration={100}
      confettiSource={{
        x: 0,
        y: 0,
        w: width ?? 0,
        h: height ?? 0,
      }}
      className="!z-[9999]"
    />,
    document.body,
  );
}
