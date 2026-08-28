import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cinemaApi } from '@/api/cinemaApi';
import toast from 'react-hot-toast';
import { Tv, Plus, Trash2, ArrowLeft, Building2, Armchair, Sparkles } from 'lucide-react';
import { Button, Badge, Input } from '@/components/core';

export default function AdminRooms() {
    const { cinemaId } = useParams();
    const queryClient = useQueryClient();
    const [roomName, setRoomName] = useState('');

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
            toast.success('Thêm phòng thành công! Hệ thống đã tự động khởi tạo 50 ghế.');
            setRoomName('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi thêm phòng')
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
        createMutation.mutate({ name: roomName });
    };

    const handleDeleteRoom = (roomId, name) => {
        if (!window.confirm(`Xóa phòng "${name}" sẽ xóa luôn toàn bộ ghế và lịch chiếu liên quan. Bạn có chắc chắn?`)) return;
        deleteMutation.mutate(roomId);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold" />
                <p className="mt-4 font-medium text-cinema-text-muted">Đang tải danh sách phòng chiếu...</p>
            </div>
        );
    }

    const { cinemaInfo, rooms = [] } = data || {};
    const isSubmitting = createMutation.isPending;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="glass-card rounded-md border border-white/10 p-5 shadow-cinematic flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="gold" size="sm">
                            Hệ Thống Phòng Chiếu
                        </Badge>
                    </div>
                    <h2 className="m-0 font-display text-2xl font-bold text-cinema-text flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-cinema-gold" />
                        {cinemaInfo?.name}
                    </h2>
                    <p className="text-xs text-cinema-text-muted">
                        Địa chỉ: {cinemaInfo?.address}
                    </p>
                </div>

                <Link to="/admin/cinemas">
                    <Button variant="secondary" size="sm" className="rounded-md shrink-0" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Về Danh Sách Rạp
                    </Button>
                </Link>
            </div>

            {/* Form Thêm Phòng Mới */}
            <div className="glass-card rounded-md border border-white/10 p-5 shadow-cinematic">
                <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 w-full">
                        <Input
                            label="Tên phòng chiếu mới (Ví dụ: Screen 1, Screen 2, IMAX, 4DX...) *"
                            type="text"
                            required
                            placeholder="Nhập tên phòng chiếu..."
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        className="rounded-md font-bold tracking-wide shadow-glow-gold-sm shrink-0 w-full sm:w-auto"
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        THÊM PHÒNG CHIẾU
                    </Button>
                </form>
            </div>

            {/* Danh Sách Phòng Chiếu Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="m-0 font-display text-lg font-bold text-cinema-text flex items-center gap-2">
                        <Tv className="w-5 h-5 text-cinema-gold" />
                        Danh Sách Phòng Chiếu Hiện Có ({rooms.length})
                    </h3>
                </div>

                {rooms.length === 0 ? (
                    <div className="glass-card rounded-md border border-white/10 p-12 text-center text-cinema-text-muted space-y-2">
                        <Tv className="w-10 h-10 text-cinema-text-dim mx-auto" />
                        <p className="text-sm font-semibold">Cụm rạp này hiện chưa có phòng chiếu nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map(room => (
                            <div
                                key={room.id}
                                className="glass-card rounded-md border border-white/10 p-5 shadow-sm space-y-4 hover:border-cinema-gold/30 transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="m-0 text-lg font-bold text-cinema-text">
                                            {room.name}
                                        </h4>
                                        <Badge variant="purple" size="sm">
                                            2D / 3D
                                        </Badge>
                                    </div>
                                    <p className="m-0 text-xs text-cinema-text-muted flex items-center gap-1.5">
                                        <Armchair className="w-3.5 h-3.5 text-cinema-gold" />
                                        <span>Sức chứa: <strong>{room.total_seats || 50} ghế</strong> (Standard & VIP)</span>
                                    </p>
                                </div>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteRoom(room.id, room.name)}
                                    className="w-full rounded-md text-xs mt-2"
                                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                                >
                                    Xóa Phòng
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}