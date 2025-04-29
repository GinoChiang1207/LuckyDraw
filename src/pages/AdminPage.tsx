import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { TrashIcon } from '@heroicons/react/24/outline';
import lotteryBg from '../assets/images/lottery_bg.png';
import {
  Participant,
  RawParticipant,
  PrizeConfig,
  PrizeType,
  prizeOrder,
  prizeOptions
} from '../types/AdminPageTypes';

const STORAGE_KEY = 'token2049_prize_config';
const PARTICIPANTS_KEY = 'token2049_participants';
const WINNERS_KEY = 'token2049_winners';

const AdminPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState<{
    email: string;
    uid: string;
    name: string;
    prize: string;
  }>({
    email: '',
    uid: '',
    name: '',
    prize: ''
  });
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [prizeConfig, setPrizeConfig] = useState<PrizeConfig>({
    '特等奖': 0,
    '一等奖': 0,
    '二等奖': 0,
    '幸运奖': 0
  });

  const sortedParticipants = [...participants].sort((a, b) => {
    if (prizeOrder[a.prize as PrizeType] !== prizeOrder[b.prize as PrizeType]) {
      return prizeOrder[a.prize as PrizeType] - prizeOrder[b.prize as PrizeType];
    }
    return a.uid.localeCompare(b.uid);
  });

  // Load prize config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setPrizeConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved prize config:', error);
      }
    }
  }, []);

  // 添加一个 useEffect 来监听 participants 和 winners 的变化
  useEffect(() => {
    try {
      if (participants) {
        localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
      }
      if (winners) {
        localStorage.setItem(WINNERS_KEY, JSON.stringify(winners));
      }
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [participants, winners]);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadStatus('處理中...');
    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as RawParticipant[];
        
        const processedData = jsonData.map(item => ({
          email: item['邮箱'] || item['email'] || '',
          uid: item['UID'] || item['uid'] || '',
          prize: item['奖项'] || item['prize'] || '',
          name: item['姓名'] || item['name'] || ''
        }));

        // 检查奖项数量
        const prizeCounts = {
          special: processedData.filter(p => p.prize === '特等奖').length,
          first: processedData.filter(p => p.prize === '一等奖').length,
          second: processedData.filter(p => p.prize === '二等奖').length,
          lucky: processedData.filter(p => p.prize === '幸运奖').length
        };

        // 检查是否超过设置的数量
        const errors: string[] = [];
        if (prizeCounts.special > prizeConfig['特等奖']) {
          errors.push(`特等奖数量(${prizeCounts.special})超过设置数量(${prizeConfig['特等奖']})`);
        }
        if (prizeCounts.first > prizeConfig['一等奖']) {
          errors.push(`一等奖数量(${prizeCounts.first})超过设置数量(${prizeConfig['一等奖']})`);
        }
        if (prizeCounts.second > prizeConfig['二等奖']) {
          errors.push(`二等奖数量(${prizeCounts.second})超过设置数量(${prizeConfig['二等奖']})`);
        }
        if (prizeCounts.lucky > prizeConfig['幸运奖']) {
          errors.push(`幸运奖数量(${prizeCounts.lucky})超过设置数量(${prizeConfig['幸运奖']})`);
        }

        if (errors.length > 0) {
          setUploadStatus(`匯入失敗: ${errors.join('; ')}`);
          return;
        }

        setParticipants(processedData);
        setUploadStatus(`成功匯入 ${processedData.length} 筆資料`);
      } else if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: (results: { data: RawParticipant[] }) => {
            const processedData = results.data.map(item => ({
              email: item['邮箱'] || item['email'] || '',
              uid: item['UID'] || item['uid'] || '',
              prize: item['奖项'] || item['prize'] || '',
              name: item['姓名'] || item['name'] || ''
            }));

            // 检查奖项数量
            const prizeCounts = {
              special: processedData.filter(p => p.prize === '特等奖').length,
              first: processedData.filter(p => p.prize === '一等奖').length,
              second: processedData.filter(p => p.prize === '二等奖').length,
              lucky: processedData.filter(p => p.prize === '幸运奖').length
            };

            // 检查是否超过设置的数量
            const errors: string[] = [];
            if (prizeCounts.special > prizeConfig['特等奖']) {
              errors.push(`特等奖数量(${prizeCounts.special})超过设置数量(${prizeConfig['特等奖']})`);
            }
            if (prizeCounts.first > prizeConfig['一等奖']) {
              errors.push(`一等奖数量(${prizeCounts.first})超过设置数量(${prizeConfig['一等奖']})`);
            }
            if (prizeCounts.second > prizeConfig['二等奖']) {
              errors.push(`二等奖数量(${prizeCounts.second})超过设置数量(${prizeConfig['二等奖']})`);
            }
            if (prizeCounts.lucky > prizeConfig['幸运奖']) {
              errors.push(`幸运奖数量(${prizeCounts.lucky})超过设置数量(${prizeConfig['幸运奖']})`);
            }

            if (errors.length > 0) {
              setUploadStatus(`匯入失敗: ${errors.join('; ')}`);
              return;
            }

            setParticipants(processedData);
            setUploadStatus(`成功匯入 ${processedData.length} 筆資料`);
          },
          error: (error: Error) => {
            setUploadStatus(`匯入失敗: ${error.message}`);
          }
        });
      }
    } catch (error) {
      setUploadStatus(`匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }, [prizeConfig]);

  const addParticipant = () => {
    if (newParticipant.prize.trim()) {
      const updatedParticipants = [...participants, {
        email: newParticipant.email.trim(),
        uid: newParticipant.uid.trim(),
        name: newParticipant.name.trim(),
        prize: newParticipant.prize.trim()
      }];
      setParticipants(updatedParticipants);
      setNewParticipant({
        email: '',
        uid: '',
        name: '',
        prize: ''
      });
    }
  };

  const removeParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
  };


  const handlePrizeConfigChange = (type: keyof PrizeConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    setPrizeConfig(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const savePrizeConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prizeConfig));
      alert('奖项设置已保存');
    } catch (error) {
      console.error('Failed to save prize config:', error);
      alert('保存失败，请重试');
    }
  };

  const fillPrizeGaps = () => {
    const updatedParticipants = [...participants];
    let changesMade = false;

    // 处理每个奖项
    Object.entries(prizeOrder).forEach(([prize, _]) => {
      const prizeType = prize as PrizeType;
      const currentWinners = updatedParticipants.filter(p => p.prize === prizeType).length;
      const targetCount = prizeConfig[prizeType];

      console.log(`处理奖项 ${prizeType}: 当前 ${currentWinners} / 目标 ${targetCount}`);

      if (currentWinners < targetCount) {
        // 获取所有未得奖的参与者
        const availableParticipants = updatedParticipants.filter(p => !p.prize);
        console.log(`可用参与者数量: ${availableParticipants.length}`);

        if (availableParticipants.length > 0) {
          // 随机打乱数组
          const shuffled = [...availableParticipants].sort(() => Math.random() - 0.5);
          
          // 计算需要抽取的数量
          const neededCount = targetCount - currentWinners;
          const selectedCount = Math.min(neededCount, shuffled.length);
          
          console.log(`需要抽取 ${neededCount} 人，实际抽取 ${selectedCount} 人`);

          // 更新选中的参与者
          shuffled.slice(0, selectedCount).forEach(winner => {
            const index = updatedParticipants.findIndex(p => p.uid === winner.uid);
            if (index !== -1) {
              updatedParticipants[index] = {
                ...updatedParticipants[index],
                prize: prizeType
              };
              changesMade = true;
            }
          });
        }
      }
    });

    if (changesMade) {
      console.log('更新参与者列表');
      setParticipants(updatedParticipants);
      alert('已随机补充得奖者');
    } else {
      alert('所有奖项数量已满足设置要求');
    }
  };

  // 添加一个函数来检查每个奖项的得奖人数
  const checkPrizeCounts = () => {
    Object.entries(prizeOrder).forEach(([prize, _]) => {
      const prizeType = prize as PrizeType;
      const currentWinners = participants.filter(p => p.prize === prizeType).length;
      const targetCount = prizeConfig[prizeType];
      console.log(`${prizeType}: ${currentWinners}/${targetCount}`);
    });
  };

  // 在组件挂载时和每次更新参与者后检查得奖人数
  useEffect(() => {
    checkPrizeCounts();
  }, [participants]);

  const resetParticipants = () => {
    if (window.confirm('确定要清除所有参与者数据吗？此操作不可恢复。')) {
      try {
        localStorage.removeItem(PARTICIPANTS_KEY);
        setParticipants([]);
        window.location.reload(); // 重新加载页面
        alert('参与者数据已成功清除');
      } catch (error) {
        console.error('清除参与者数据失败:', error);
        alert('清除参与者数据失败，请重试');
      }
    }
  };

  const resetWinners = () => {
    if (window.confirm('确定要清除所有得奖者名单吗？此操作不可恢复。')) {
      try {
        localStorage.removeItem(WINNERS_KEY);
        setWinners([]);
        window.location.reload(); // 重新加载页面
        alert('得奖者名单已成功清除');
      } catch (error) {
        console.error('清除得奖者名单失败:', error);
        alert('清除得奖者名单失败，请重试');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${lotteryBg})` }}
      />
      <div className="relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
        >
          Token 2049 Admin Panel
        </motion.h1>

        {/* Prize Configuration Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Prize Settings</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Special Prize</label>
              <input
                type="number"
                min="0"
                value={prizeConfig['特等奖']}
                onChange={(e) => handlePrizeConfigChange('特等奖', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">First Prize</label>
              <input
                type="number"
                min="0"
                value={prizeConfig['一等奖']}
                onChange={(e) => handlePrizeConfigChange('一等奖', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Second Prize</label>
              <input
                type="number"
                min="0"
                value={prizeConfig['二等奖']}
                onChange={(e) => handlePrizeConfigChange('二等奖', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Lucky Prize</label>
              <input
                type="number"
                min="0"
                value={prizeConfig['幸运奖']}
                onChange={(e) => handlePrizeConfigChange('幸运奖', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={savePrizeConfig}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Participants Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 p-6 rounded-lg border border-gray-800"
          >
            <h2 className="text-2xl font-bold mb-4">Participants</h2>
            
            {/* File Upload Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Batch Import (CSV/Excel)
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
              />
              {uploadStatus && (
                <p className="mt-2 text-sm text-gray-400">{uploadStatus}</p>
              )}
            </div>

            {/* New Participant Form */}
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="text"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">UID</label>
                  <input
                    type="text"
                    value={newParticipant.uid}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, uid: e.target.value }))}
                    placeholder="UID"
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prize</label>
                  <select
                    value={newParticipant.prize}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, prize: e.target.value }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Prize</option>
                    {prizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={addParticipant}
                className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Participant
              </button>
            </div>

            {/* Participants List */}
            <div className="space-y-2 overflow-y-auto mb-4">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-400">Email: {participant.email}</span>
                    <span className="text-sm text-gray-400">UID: {participant.uid}</span>
                    <span className="text-sm text-gray-400">Name: {participant.name}</span>
                    <span className="text-sm text-gray-400">Prize: <span className="text-yellow-400">{participant.prize}</span></span>
                  </div>
                  <button
                    onClick={() => removeParticipant(index)}
                    className="text-red-500 hover:text-red-400 transition-colors p-1"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Reset Participants Button */}
            <button
              onClick={resetParticipants}
              className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Participants
            </button>
          </motion.div>

          {/* Winners Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 p-6 rounded-lg border border-gray-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Winners</h2>
              <div className="flex gap-2">
                <button
                  onClick={checkPrizeCounts}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check Winners
                </button>
                <button
                  onClick={fillPrizeGaps}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fill Gaps
                </button>
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              {Object.entries(prizeOrder).map(([prize]) => {
                const prizeType = prize as PrizeType;
                const prizeWinners = sortedParticipants.filter(p => p.prize === prizeType);
                if (prizeWinners.length === 0) return null;

                return (
                  <div key={prize} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-yellow-400">{prize}</h3>
                      <span className="text-sm text-gray-400">
                        {prizeWinners.length}/{prizeConfig[prizeType]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {prizeWinners.map((participant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                        >
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm text-gray-400">UID: {participant.uid}</span>
                            <span className="text-sm text-gray-400">Name: {participant.name}</span>
                            <span className="text-sm text-gray-400">Email: {participant.email}</span>
                          </div>
                          <button
                            onClick={() => removeParticipant(participants.findIndex(p => p.uid === participant.uid))}
                            className="text-red-500 hover:text-red-400 transition-colors p-1"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reset Winners Button */}
            <button
              onClick={resetWinners}
              className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Winners
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 