import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Network, Thermometer, ShieldAlert, Zap, Terminal, Box } from 'lucide-react';

interface NodeStatus {
    id: number;
    status: 'ONLINE' | 'OFFLINE' | 'THROTTLED' | 'SYNCING';
    load: number;
    temp: number;
}

export const NodeOrchestrator: React.FC = () => {
    const [nodes, setNodes] = useState<NodeStatus[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tuningModal, setTuningModal] = useState(false);

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const res = await fetch('/api/nodes');
                const data = await res.json();
                setNodes(data.nodes);
                setStats(data.stats);
                setLoading(false);
            } catch (err) {
                console.error("[AZRAEL] TELEMETRY_STALL:", err);
            }
        };

        fetchNodes();
        const interval = setInterval(fetchNodes, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black border border-red-900/30 p-6 space-y-6 font-mono">
            {/* Header / Global Status */}
            <div className="flex flex-wrap items-center gap-6 border-b border-red-900/40 pb-6">
                <div className="flex items-center gap-3">
                    <Box className="w-8 h-8 text-red-500 animate-pulse" />
                    <div>
                        <h2 className="text-xl font-bold tracking-[0.2em] uppercase italic text-red-500">Node Orchestrator</h2>
                        <div className="text-[10px] text-gray-500">S-1792 // TRI-TIER_HYBRID_ARRAY</div>
                    </div>
                </div>

                {stats && (
                    <div className="flex gap-8 ml-auto overflow-x-auto pb-2">
                        <div className="space-y-1">
                            <div className="text-[9px] text-gray-600 uppercase">Throughput</div>
                            <div className="text-xs text-white font-bold">{stats.network_throughput}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[9px] text-gray-600 uppercase">WASM_Nodes</div>
                            <div className="text-xs text-white font-bold">{stats.wasm_modules}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[9px] text-gray-600 uppercase">Thermal</div>
                            <div className={`text-xs font-bold ${stats.thermal_load === 'OPTIMAL' ? 'text-green-500' : 'text-red-500'}`}>
                                {stats.thermal_load}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 1000 Node Swarm Visualization */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-red-500">Distributed_Swarm_Visual (1,000 Nodes)</span>
                        </div>
                        <div className="flex gap-3 text-[9px]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500"></div> ONLINE</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600"></div> OFFLINE</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-600 animate-pulse"></div> THROTTLED</div>
                        </div>
                    </div>

                    <div className="bg-red-950/5 border border-red-950 p-2 min-h-[400px] overflow-y-auto">
                        <div className="grid grid-cols-10 sm:grid-cols-20 md:grid-cols-25 lg:grid-cols-50 gap-[2px]">
                            {loading ? (
                                Array.from({ length: 1000 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-900 animate-pulse" />
                                ))
                            ) : (
                                nodes.map((node) => (
                                    <motion.div
                                        key={node.id}
                                        initial={false}
                                        animate={{ 
                                            backgroundColor: node.status === 'ONLINE' ? '#22c55e' : 
                                                             node.status === 'OFFLINE' ? '#991b1b' : 
                                                             '#ca8a04',
                                            opacity: (node.load / 100) * 0.5 + 0.5
                                        }}
                                        className="aspect-square relative group"
                                    >
                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-black border border-red-500 p-2 text-[8px] whitespace-nowrap">
                                            <div>NODE_ID: {node.id}</div>
                                            <div>LOAD: {node.load}%</div>
                                            <div>TEMP: {node.temp}°C</div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Control & Telemetry Panels */}
                <div className="space-y-6">
                    {/* Tier 1 Hardening */}
                    <div className="bg-red-950/10 border border-red-900/30 p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b border-red-900/20 pb-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Tier 1: Local_Kernel</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-500">ZRAM_ALLOCATION:</span>
                                <span className="text-green-500">4.0GB</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-500">VULKAN_UI_OFFLOAD:</span>
                                <span className="text-green-500">ENABLED</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-500">BACKLOG_DEPTH:</span>
                                <span className="text-white">8192</span>
                            </div>
                            <button 
                                onClick={() => setTuningModal(true)}
                                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 py-2 text-[10px] font-bold transition-all"
                            >
                                <Terminal className="w-3 h-3 inline-block mr-2" /> RE-TUNE_KERNEL
                            </button>
                        </div>
                    </div>

                    {/* Tier 2 Orchestration */}
                    <div className="bg-purple-950/10 border border-purple-900/30 p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b border-purple-900/20 pb-2">
                            <Zap className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Tier 2: WASM_Edge</span>
                        </div>
                        <div className="space-y-1 text-[10px] font-mono text-purple-400 opacity-60">
                            <div>- wasm_edge.v3 initiated</div>
                            <div>- orchestrator_id: az-792x</div>
                            <div>- heartbeat: 200ms</div>
                        </div>
                        <div className="h-2 bg-purple-900/20 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-1/2 h-full bg-purple-500"
                            />
                        </div>
                    </div>

                    {/* Thermal Sentry */}
                    <div className="bg-black border border-red-900/20 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Thermal_Sentry</span>
                        </div>
                        <div className="relative h-1 bg-gray-900">
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-full opacity-20" />
                            <motion.div 
                                animate={{ left: "42%" }}
                                className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white"
                            />
                        </div>
                        <div className="text-[9px] text-gray-500 flex justify-between uppercase">
                            <span>Ambient: 22°C</span>
                            <span className="text-white">Core: 54°C</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kernel Tuning Modal / Overlay */}
            {tuningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black border border-red-900 p-8 max-w-2xl w-full space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-red-900 pb-4">
                            <Terminal className="w-6 h-6 text-red-500" />
                            <h3 className="text-lg font-bold uppercase tracking-widest">S-1792 Optimization System</h3>
                        </div>
                        <div className="bg-red-950/10 p-4 font-mono text-[10px] text-red-400 space-y-1 overflow-y-auto max-h-[300px]">
                            <div># INITIATING_KERNEL_PURGE...</div>
                            <div># setprop debug.hwui.renderer skiavk [SUCCESS]</div>
                            <div className="text-red-600 animate-pulse"># swapoff /dev/block/zram0...</div>
                            <div># echo 4294967296 &gt; /sys/block/zram0/disksize [SUCCESS]</div>
                            <div># net.core.rmem_max=16777216 [SUCCESS]</div>
                            <div className="text-gray-600 pt-4"># EXECUTING_REMAINING_TELEMETRY_BLOCKS...</div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setTuningModal(false)}
                                className="flex-1 bg-red-500 text-black font-black uppercase text-xs py-3 hover:bg-red-400"
                            >
                                Commit_Tuning
                            </button>
                            <button 
                                onClick={() => setTuningModal(false)}
                                className="bg-red-950/20 text-red-500 border border-red-900 px-6 py-3 font-bold uppercase text-xs"
                            >
                                Abort
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
