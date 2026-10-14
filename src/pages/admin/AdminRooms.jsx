import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cinemaApi } from '@/api/cinemaApi';
import toast from 'react-hot-toast';
import {
    Tv,
    Plus,
    Trash2,
    ArrowLeft,
    Building2,
    Armchair,
    Edit3,
    Check,
    X,
    Eye
} from 'lucide-react';
import { Button, Badge, Input } from '@/components/core';

const ROOM_NAME_PRESETS = ['Screen 1', 'Screen 2', 'Screen 3', 'IMAX Laser', '4DX', 'Gold Class'];
const ROWS = [
    { letter: 'A', type: 'Standard', color: 'bg-[#2A2D48] border-white/15 text-cinema-text' },
    { letter: 'B', type: 'Standard', color: 'bg-[#2A2D48] border-white/15 text-cinema-text' },
    { letter: 'C', type: 'VIP', color: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
    { letter: 'D', type: 'VIP', color: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
    { letter: 'E', type: 'Sweetbox', color: 'bg-pink-500/20 border-pink-500/40 text-pink-300' },
];

export default function AdminRooms() {
    const { cinemaId } = useParams();
    const queryClient = useQueryClient();
    const [roomName, setRoomName] = useState('');
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [previewRoom, setPreviewRoom] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-rooms', cinemaId],
        queryFn: async () => {
            const [cinemaRes, roomsRes] = await Promise.all([
                cinemaApi.getById(cinemaId),
                cinemaApi.getRooms(cinemaId)
            ]);
            return {
                cinemaInfo: cinemaRes.data,
                rooms: roomsRes.data
            };
        },
        onError: () => toast.error('Lỗi tải dữ liệu phòng')
    });

    const createMutation = useMutation({
        mutationFn: (newRoom) => cinemaApi.createRoom(cinemaId, newRoom),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-rooms', cinemaId]);
            toast.success('Thêm phòng thành công! Đã tự động khởi tạo 50 ghế.');
            setRoomName('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi thêm phòng')
    });

    const updateMutation = useMutation({
        mutationFn: ({ roomId, name }) => cinemaApi.updateRoom(cinemaId, roomId, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-rooms', cinemaId]);
            toast.success('Đã đổi tên phòng chiếu');
            setEditingRoomId(null);
            setEditingName('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể cập nhật tên phòng')
    });

    const deleteMutation = useMutation({
        mutationFn: (roomId) => cinemaApi.deleteRoom(cinemaId, roomId),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-rooms', cinemaId]);
            toast.success('Đã xóa phòng chiếu');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa phòng này')
    });

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!roomName.trim()) return toast.error('Vui lòng nhập tên phòng');
        createMutation.mutate({ name: roomName.trim() });
    };

    const handleSaveRename = (roomId) => {
        if (!editingName.trim()) return toast.error('Tên phòng không được để trống');
        updateMutation.mutate({ roomId, name: editingName.trim() });
    };

    const handleDeleteRoom = (roomId, name) => {
        if (!window.confirm(`Xóa phòng "${name}" sẽ xóa luôn toàn bộ ghế và lịch chiếu liên quan. Bạn có chắc chắn?`)) return;
        deleteMutation.mutate(roomId);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cinema-gold" />
                <p className="mt-3 text-xs font-medium text-cinema-text-muted">Đang tải danh sách phòng chiếu...</p>
            </div>
        );
    }

    const { cinemaInfo, rooms = [] } = data || {};
    const isSubmitting = createMutation.isPending;
    const totalSeats = rooms.reduce((sum, r) => sum + Number(r.total_seats || 50), 0);

    return (
        <div className="space-y-5">
            {/* Header Banner */}
            <div className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="gold" size="sm">
                            Cụm Rạp & Phòng Chiếu
                        </Badge>
                        <span className="text-xs text-cinema-text-dim tabular-nums">
                            • {rooms.length} phòng • Tổng {totalSeats} ghế
                        </span>
                    </div>
                    <h2 className="m-0 font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-cinema-gold shrink-0" />
                        <span>{cinemaInfo?.name}</span>
                    </h2>
                    <p className="m-0 text-xs text-cinema-text-muted">
                        Địa chỉ: {cinemaInfo?.address}
                    </p>
                </div>

                <Link to="/admin/cinemas" className="shrink-0">
                    <Button variant="secondary" size="sm" className="rounded-md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Danh sách cụm rạp
                    </Button>
                </Link>
            </div>

            {/* Form Thêm Phòng Mới */}
            <div className="rounded-md border border-white/10 bg-[#121324] p-4 space-y-3">
                <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 w-full">
                        <Input
                            label="Thêm phòng chiếu mới (Mặc định tự động khởi tạo 50 ghế: 2 hàng Thường, 2 hàng VIP, 1 hàng Sweetbox) *"
                            size="sm"
                            type="text"
                            required
                            placeholder="Nhập tên phòng chiếu (VD: Screen 1, IMAX)..."
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isSubmitting}
                        className="rounded-md font-bold tracking-wide shrink-0 w-full sm:w-auto"
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Thêm Phòng Chiếu
                    </Button>
                </form>

                {/* Quick Name Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-cinema-text-dim mr-1">Gợi ý tên nhanh:</span>
                    {ROOM_NAME_PRESETS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => setRoomName(preset)}
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-medium text-cinema-text-muted hover:text-cinema-gold hover:border-cinema-gold/40 transition cursor-pointer"
                        >
                            + {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Danh Sách Phòng Chiếu Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                        <Tv className="w-4 h-4 text-cinema-gold" />
                        Danh Sách Phòng Chiếu Hiện Có ({rooms.length})
                    </h3>
                </div>

                {rooms.length === 0 ? (
                    <div className="rounded-md border border-white/10 bg-[#121324] p-12 text-center text-cinema-text-muted space-y-2">
                        <Tv className="w-8 h-8 text-cinema-text-dim mx-auto" />
                        <p className="text-xs font-medium">Cụm rạp này hiện chưa có phòng chiếu nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map((room) => {
                            const isEditing = editingRoomId === room.id;
                            return (
                                <div
                                    key={room.id}
                                    className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col justify-between gap-4 hover:border-white/20 transition-colors"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="w-full rounded border border-cinema-gold bg-[#0E101E] px-2.5 py-1 text-xs font-bold text-white outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveRename(room.id)}
                                                        disabled={updateMutation.isPending}
                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-pointer"
                                                        title="Lưu tên mới"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingRoomId(null)}
                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white/5 text-cinema-text-muted border border-white/10 cursor-pointer"
                                                        title="Hủy"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="m-0 text-base font-bold text-white truncate">
                                                        {room.name}
                                                    </h4>
                                                    <Badge variant="purple" size="sm">
                                                        2D / 3D Standard
                                                    </Badge>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 rounded bg-[#17192E] p-2.5 border border-white/[0.06] text-xs">
                                            <div className="flex items-center justify-between text-cinema-text-muted">
                                                <span className="flex items-center gap-1.5">
                                                    <Armchair className="w-3.5 h-3.5 text-cinema-gold" />
                                                    Tổng sức chứa:
                                                </span>
                                                <strong className="text-white tabular-nums">{room.total_seats || 50} ghế</strong>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-cinema-text-dim pt-1 border-t border-white/[0.05]">
                                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-cinema-text-muted">20 Thường</span>
                                                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300">20 VIP</span>
                                                <span className="px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300">10 Đôi</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewRoom(room)}
                                            className="flex-1 inline-flex h-8 items-center justify-center gap-1.5 px-2.5 rounded border border-cinema-gold/30 bg-cinema-gold/10 text-xs font-semibold text-cinema-gold hover:bg-cinema-gold hover:text-cinema-bg transition cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Sơ đồ ghế</span>
                                        </button>

                                        <button
                                            type="button"
                                            title="Đổi tên phòng"
                                            onClick={() => {
                                                setEditingRoomId(room.id);
                                                setEditingName(room.name);
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:text-blue-400 hover:border-blue-400/50 transition cursor-pointer"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            title="Xóa phòng chiếu"
                                            onClick={() => handleDeleteRoom(room.id, room.name)}
                                            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:text-red-400 hover:border-red-400/50 transition cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Preview Sơ Đồ Ghế */}
            {previewRoom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
                    <div
                        className="fixed inset-0"
                        onClick={() => setPreviewRoom(null)}
                    />
                    <div className="relative z-10 w-full max-w-xl rounded-md border border-white/15 bg-[#121324] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#16182D] px-5 py-3.5">
                            <div>
                                <h3 className="m-0 font-display text-base font-bold text-white flex items-center gap-2">
                                    <Armchair className="w-4 h-4 text-cinema-gold" />
                                    Sơ Đồ Phòng: {previewRoom.name}
                                </h3>
                                <p className="m-0 text-[11px] text-cinema-text-dim">
                                    {cinemaInfo?.name} • Cấu hình 5 hàng x 10 ghế tiêu chuẩn
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewRoom(null)}
                                className="p-1.5 rounded text-cinema-text-muted hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Screen Indicator */}
                            <div className="text-center space-y-1.5">
                                <div className="mx-auto h-1.5 w-3/4 rounded-full bg-gradient-to-r from-transparent via-cinema-gold to-transparent opacity-80" />
                                <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-cinema-text-dim">
                                    MÀN HÌNH CHIẾU (SCREEN)
                                </span>
                            </div>

                            {/* 5x10 Seat Grid */}
                            <div className="space-y-2 overflow-x-auto py-2">
                                {ROWS.map((row) => (
                                    <div key={row.letter} className="flex items-center justify-center gap-1.5 min-w-[380px]">
                                        <span className="w-5 text-xs font-bold text-cinema-text-dim text-center">
                                            {row.letter}
                                        </span>
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((col) => (
                                            <div
                                                key={col}
                                                className={`flex h-7 w-8 items-center justify-center rounded border text-[10px] font-bold tabular-nums select-none ${row.color}`}
                                            >
                                                {row.letter}{col}
                                            </div>
                                        ))}
                                        <span className="w-5 text-xs font-bold text-cinema-text-dim text-center">
                                            {row.letter}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-3 text-xs text-cinema-text-muted">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-sm bg-[#2A2D48] border border-white/15" />
                                    Ghế Thường (A-B)
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-sm bg-purple-500/20 border border-purple-500/40" />
                                    Ghế VIP (C-D)
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-sm bg-pink-500/20 border border-pink-500/40" />
                                    Ghế Sweetbox (E)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}