import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cinemaApi } from '../../api/cinemaApi';
import toast from 'react-hot-toast';

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
            toast.success('Thêm phòng thành công! Hệ thống đã tự động tạo 50 ghế tiêu chuẩn.');
            setRoomName('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi thêm phòng')
    });

    const deleteMutation = useMutation({
        mutationFn: (roomId) => cinemaApi.deleteRoom(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-rooms', cinemaId]);
            toast.success('Đã xóa phòng chiếu');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa phòng này')
    });

    const handleCreateRoom = (e) => {
        e.preventDefault();
        createMutation.mutate({ name: roomName });
    };

    const handleDeleteRoom = (roomId) => {
        if (!window.confirm('Xóa phòng này sẽ xóa luôn 50 ghế bên trong. Bạn có chắc chắn?')) return;
        deleteMutation.mutate(roomId);
    };

    if (isLoading) return <div className="py-10 text-center text-brand-text">Đang tải hệ thống...</div>;

    const { cinemaInfo, rooms = [] } = data || {};
    const isSubmitting = createMutation.isLoading;

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            {/* Thanh điều hướng quay lại */}
            <div className="mb-4">
                <Link to="/admin/cinemas" className="inline-block text-sm font-bold text-brand-500 hover:text-brand-600">← Quay lại Danh sách Rạp</Link>
            </div>

            <h1 className="m-0 border-b border-brand-border pb-3 font-display text-[34px] text-brand-dark min-[0px]:max-[420px]:text-[28px]">
                Quản Lý Phòng: <span>{cinemaInfo?.name}</span>
            </h1>

            {/* FORM THÊM PHÒNG NHANH */}
            <div className="mt-5 border border-brand-border bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                <form onSubmit={handleCreateRoom} className="flex gap-4 md:flex-col">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-brand-dark mb-2">Tên phòng mới (Ví dụ: Room 1, IMAX...):</label>
                        <input
                            type="text" required value={roomName} onChange={(e) => setRoomName(e.target.value)}
                            className="w-full border border-brand-border px-3 py-2 text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-fit bg-brand-500 px-6 py-2 font-bold text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Đang tạo...' : 'Thêm Phòng'}
                    </button>
                </form>
            </div>

            {/* DANH SÁCH PHÒNG */}
            <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-2 sm:grid-cols-1">
                {rooms.length === 0 ? (
                    <p className="col-span-full text-center text-brand-text-muted">Rạp này chưa có phòng chiếu nào.</p>
                ) : (
                    rooms.map(room => (
                        <div key={room.id} className="border border-brand-border bg-white p-4 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                            <div>
                                <h3 className="m-0 font-bold text-brand-dark">{room.name}</h3>
                                <p className="mb-0 m-0 mt-1 text-sm text-brand-text-muted">Sức chứa: 50 ghế</p>
                            </div>
                            <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="mt-3 w-full bg-brand-error px-4 py-2 text-sm font-bold text-white hover:bg-[#8a1924]"
                                type="button"
                            >
                                Xóa
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}