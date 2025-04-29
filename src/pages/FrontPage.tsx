import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import lotteryBg from '../assets/images/lottery_bg.png';
import weexLogo from '../assets/images/weexlogo.png';
import specialPrize from '../assets/images/special-prize.png';
import firstPrize from '../assets/images/first-prize.png';
import secondPrize from '../assets/images/second-prize.png';
import luckyPrize from "../assets/images/lucky-prize.png";
import '../styles/prize.css';
import { Winner, Participant, STORAGE_KEYS } from '../types/FrontPageTypes';

const FrontPage = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentDisplayStage, setCurrentDisplayStage] = useState(0); // 0: 未开始, 1: 幸运奖, 2: 二等奖, 3: 一等奖, 4: 特等奖

  // 显示获奖者
  const displayWinners = (winners: Winner[]) => {
    setWinners(winners);
    setShowResult(true);
  };

  // 从localStorage加载得奖者数据
  useEffect(() => {
    const participantsData = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    const winnersData = localStorage.getItem(STORAGE_KEYS.WINNERS);
    
    if (participantsData) {
      const participants: Participant[] = JSON.parse(participantsData);
      if (winnersData) {
        const winners: Winner[] = JSON.parse(winnersData);
        setWinners(winners);
        setShowResult(winners.length > 0);
      } else {
        // 如果没有独立的winners数据，从participants中过滤
        const winners = participants
          .filter(p => p.prize && p.prize !== '')
          .map(p => ({
            name: p.name,
            uid: p.uid,
            prize: p.prize
          }));
        setWinners(winners);
        setShowResult(winners.length > 0);
      }
    }
  }, []);

  // 监听winners变化，更新本地存储
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(winners));
    } catch (error) {
      console.error('Failed to save winners to localStorage:', error);
    }
  }, [winners]);

  const startDrawing = () => {
    setIsDrawing(true);
    
    try {
      // 获取所有参与者
      const participantsData = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      if (!participantsData) {
        alert('Please add participants in the admin panel first');
        setIsDrawing(false);
        return;
      }

      const participants: Participant[] = JSON.parse(participantsData);
      
      // 获取奖项设置
      const prizeConfigData = localStorage.getItem(STORAGE_KEYS.PRIZE_CONFIG);
      if (!prizeConfigData) {
        alert('Please configure prizes in the admin panel first');
        setIsDrawing(false);
        return;
      }

      const prizeConfig = JSON.parse(prizeConfigData);
      const targetLuckyCount = prizeConfig['幸运奖'];
      const targetSecondCount = prizeConfig['二等奖'];
      const targetFirstCount = prizeConfig['一等奖'];
      const targetSpecialCount = prizeConfig['特等奖'];

      // 获取已得奖的参与者
      const existingLuckyWinners = participants.filter((p: Participant) => p.prize === '幸运奖');
      const existingSecondWinners = participants.filter((p: Participant) => p.prize === '二等奖');
      const existingFirstWinners = participants.filter((p: Participant) => p.prize === '一等奖');
      const existingSpecialWinners = participants.filter((p: Participant) => p.prize === '特等奖');

      // 补足所有奖项的数量
      const fillPrizeGaps = () => {
        const updatedParticipants = [...participants];
        let changesMade = false;

        // 获取所有未得奖的参与者
        const availableParticipants = updatedParticipants.filter(p => !p.prize);
        if (availableParticipants.length === 0) {
          return false;
        }

        // 随机打乱数组
        const shuffled = [...availableParticipants].sort(() => Math.random() - 0.5);
        let currentIndex = 0;

        // 补足幸运奖
        if (existingLuckyWinners.length < targetLuckyCount) {
          const neededCount = targetLuckyCount - existingLuckyWinners.length;
          const selectedCount = Math.min(neededCount, shuffled.length - currentIndex);
          for (let i = 0; i < selectedCount; i++) {
            const winner = shuffled[currentIndex + i];
            const index = updatedParticipants.findIndex(p => p.uid === winner.uid);
            if (index !== -1) {
              updatedParticipants[index].prize = '幸运奖';
              changesMade = true;
            }
          }
          currentIndex += selectedCount;
        }

        // 补足二等奖
        if (existingSecondWinners.length < targetSecondCount && currentIndex < shuffled.length) {
          const neededCount = targetSecondCount - existingSecondWinners.length;
          const selectedCount = Math.min(neededCount, shuffled.length - currentIndex);
          for (let i = 0; i < selectedCount; i++) {
            const winner = shuffled[currentIndex + i];
            const index = updatedParticipants.findIndex(p => p.uid === winner.uid);
            if (index !== -1) {
              updatedParticipants[index].prize = '二等奖';
              changesMade = true;
            }
          }
          currentIndex += selectedCount;
        }

        // 补足一等奖
        if (existingFirstWinners.length < targetFirstCount && currentIndex < shuffled.length) {
          const neededCount = targetFirstCount - existingFirstWinners.length;
          const selectedCount = Math.min(neededCount, shuffled.length - currentIndex);
          for (let i = 0; i < selectedCount; i++) {
            const winner = shuffled[currentIndex + i];
            const index = updatedParticipants.findIndex(p => p.uid === winner.uid);
            if (index !== -1) {
              updatedParticipants[index].prize = '一等奖';
              changesMade = true;
            }
          }
          currentIndex += selectedCount;
        }

        // 补足特等奖
        if (existingSpecialWinners.length < targetSpecialCount && currentIndex < shuffled.length) {
          const neededCount = targetSpecialCount - existingSpecialWinners.length;
          const selectedCount = Math.min(neededCount, shuffled.length - currentIndex);
          for (let i = 0; i < selectedCount; i++) {
            const winner = shuffled[currentIndex + i];
            const index = updatedParticipants.findIndex(p => p.uid === winner.uid);
            if (index !== -1) {
              updatedParticipants[index].prize = '特等奖';
              changesMade = true;
            }
          }
        }

        if (changesMade) {
          localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(updatedParticipants));
        }
        return changesMade;
      };

      // 先补足所有奖项
      fillPrizeGaps();

      // 重新获取更新后的获奖者
      const updatedParticipants = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]') as Participant[];
      const updatedLuckyWinners = updatedParticipants.filter((p: Participant) => p.prize === '幸运奖');
      const updatedSecondWinners = updatedParticipants.filter((p: Participant) => p.prize === '二等奖');
      const updatedFirstWinners = updatedParticipants.filter((p: Participant) => p.prize === '一等奖');
      const updatedSpecialWinners = updatedParticipants.filter((p: Participant) => p.prize === '特等奖');

      // 根据当前显示阶段显示相应的获奖者
      const nextStage = currentDisplayStage + 1;
      setCurrentDisplayStage(nextStage > 4 ? 1 : nextStage);

      switch (nextStage) {
        case 1:
          // 显示幸运奖获奖者
          displayWinners(updatedLuckyWinners.map((w: Participant) => ({
            name: w.name,
            uid: w.uid,
            prize: w.prize
          })));
          break;
        case 2:
          // 显示幸运奖和二等奖获奖者
          displayWinners([
            ...updatedLuckyWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            })),
            ...updatedSecondWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            }))
          ]);
          break;
        case 3:
          // 显示幸运奖、二等奖和一等奖获奖者
          displayWinners([
            ...updatedLuckyWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            })),
            ...updatedSecondWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            })),
            ...updatedFirstWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            }))
          ]);
          break;
        case 4:
          // 显示所有奖项获奖者
          displayWinners([
            ...updatedLuckyWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            })),
            ...updatedSecondWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            })),
            ...updatedFirstWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            })),
            ...updatedSpecialWinners.map((w: Participant) => ({
              name: w.name,
              uid: w.uid,
              prize: w.prize
            }))
          ]);
          break;
      }
    } catch (error) {
      console.error('Drawing error:', error);
      alert(error instanceof Error ? error.message : 'Drawing failed, please try again');
    } finally {
      setIsDrawing(false);
    }
  };

  const getWinnersByPrize = (prize: string) => {
    return winners.filter(winner => winner.prize === prize);
  };


  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-[#000000] z-40">
        <div className="h-full flex items-center px-8">
          <img src={weexLogo} alt="WEEX Logo" className="w-[134px] h-[28px]" />
        </div>
      </header>

      {/* Background Image - Only below header */}
      <div
        className="absolute inset-0 top-[64px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${lotteryBg})` }}
      />

      {/* Main Content Container */}
      <div className="relative min-h-screen pt-[64px] overflow-y-auto">
        {/* Left Mask */}
        <div className="prize-mask left-0 h-auto min-h-[calc(100vh-64px)]">
          {/* Special Prize Section */}
          <div className="prize-section special-prize">
            <img src={specialPrize} alt="Special Prize" className="prize-image" />
            <div className="space-y-4 w-full">
              <AnimatePresence>
                {showResult && getWinnersByPrize("特等奖").map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <div className="prize-card first-prize-card w-full">
                      <div className="prize-card-content">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-[#E0BC36] font-bold">
                            {winner.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            UID: {winner.uid}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* First Prize Section */}
          <div className="prize-section first-prize">
            <img src={firstPrize} alt="First Prize" className="prize-image" />
            <div className="space-y-4 w-full">
              <AnimatePresence>
                {showResult && getWinnersByPrize("一等奖").map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <div className="prize-card first-prize-card w-full">
                      <div className="prize-card-content">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-[#E0BC36] font-bold">
                            {winner.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            UID: {winner.uid}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Second Prize Section */}
          <div className="prize-section">
            <img src={secondPrize} alt="Second Prize" className="prize-image" />
            <div className="space-y-4 w-full">
              <AnimatePresence>
                {showResult && getWinnersByPrize("二等奖").map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <div className="prize-card first-prize-card w-full">
                      <div className="prize-card-content">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-[#E0BC36] font-bold">
                            {winner.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            UID: {winner.uid}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Mask */}
        <div className="prize-mask right-0 h-auto min-h-[calc(100vh-64px)]">
          {/* Lucky Prize Section */}
          <div className="prize-section">
            <img src={luckyPrize} alt="Lucky Prize" className="prize-image" />
            <div className="space-y-4 w-full">
              <AnimatePresence>
                {showResult && getWinnersByPrize("幸运奖").map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <div className="prize-card first-prize-card w-full">
                      <div className="prize-card-content">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-[#E0BC36] font-bold">
                            {winner.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            UID: {winner.uid}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pt-[64px] p-4">
          <div className="mt-auto flex flex-col items-center gap-8 mb-16">
            <motion.div
              id="lottery-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-[56px] font-[700] mb-6">
                WEEX 迪拜总部 KOL<span className="text-[#D8AE15]">签到抽奖</span>
              </h2>
              <h4 className="text-[18px] font-[400] mb-6">
                欢迎莅临 WEEX 迪拜总部👋，完成签到注册，即可
                <span className="text-[#D8AE15]">参与幸运抽奖</span>
                ！惊喜体验金、定制周边、WXT大礼包等你来拿～
              </h4>
            </motion.div>
            <button
              onClick={startDrawing}
              disabled={isDrawing}
              className="w-[243px] h-[65px] rounded-[59px] text-[24px] leading-[130%] tracking-[0px] text-center hover:opacity-90 transition-opacity font-['Plus_Jakarta_Sans'] relative disabled:opacity-50"
              style={{
                background: "#E0BC36",
                color: "#000000",
                fontWeight: 700,
              }}
            >
              <div
                className="absolute inset-0 rounded-[59px]"
                style={{
                  background: "linear-gradient(90deg, #FFEA9B 0%, #F8E089 100%)",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "destination-out",
                  maskComposite: "exclude",
                  padding: "2px",
                }}
              />
              <span className="relative z-10">
                {isDrawing ? "....." : "点击抽奖"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontPage; 