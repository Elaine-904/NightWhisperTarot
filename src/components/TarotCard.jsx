// src/components/TarotCard.jsx
import React, { useRef, useState } from "react";
import { CARD_BACK } from "../data/cards";

export default function TarotCard({ card, faceUp, mode, onSwipeUp, onTap }) {
  const cardRef = useRef(null);
  const startY = useRef(null);
  const [dragY, setDragY] = useState(0);

  // 按下开始记录位置
  function handlePointerDown(e) {
    if (mode !== "draw") return;
    const y = e.touches?.[0]?.clientY ?? e.clientY;
    startY.current = y;
    setDragY(0);
  }

  // 移动过程
  function handlePointerMove(e) {
    if (mode !== "draw") return;
    if (startY.current === null) return;

    const current = e.touches?.[0]?.clientY ?? e.clientY;
    if (e.cancelable) e.preventDefault(); // 阻止页面滚动
    const delta = current - startY.current;

    // 只允许向上拖
    if (delta < 0) {
      setDragY(delta);
    }
  }

  // 松手触发
  function handlePointerUp() {
    if (mode === "draw") {
      // 上滑超过 -80px 算成功抽卡
      if (dragY < -80) {
        onSwipeUp && onSwipeUp();
      }
      setDragY(0);
    }
    startY.current = null;
  }

  // 轻点也要能抽牌（给不会拖拽的用户）
  function handleClick() {
    if (mode === "draw" && onSwipeUp) {
      onSwipeUp();
      return;
    }
    if (mode !== "draw" && onTap) {
      onTap();
    }
  }

  return (
    <div
      ref={cardRef}
      className="pixel-card-wrap"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onClick={handleClick}
      style={{
        transform: mode === "draw" ? `translateY(${dragY}px)` : undefined,
        transition: dragY === 0 ? "transform 0.35s ease" : "none",
        cursor: mode === "draw" ? "grab" : "pointer",
      }}
    >
      <div className={`pixel-card ${faceUp ? "flip" : ""}`}>
        {/* 卡背 */}
        <div className="pixel-card-face">
          <img src={CARD_BACK} className="pixel-card-img" />
        </div>

        {/* 卡面 */}
        <div className="pixel-card-face pixel-card-front">
          {card && (
            <img
              src={card.image}
              className="pixel-card-img"
              alt={card.name}
              draggable="false"
            />
          )}
        </div>
      </div>
    </div>
  );
}
