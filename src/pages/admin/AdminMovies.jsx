import { useState, useMemo, useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { movieApi } from '@/api/movieApi';
import AdminMovieForm from './AdminMovieForm';
import {
  Film,
  Plus,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Search,
  LayoutList,
  LayoutGrid,
  ExternalLink,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button, Badge, DataTable, Modal } from '@/components/core';

const STATUS_TABS = [
  { value: '', label: 'Tất cả phim' },
  { value: 'showing', label: 'Đang chiếu' },
  { value: 'coming_soon', label: 'Sắp chiếu' },
  { value: 'ended', label: 'Ngừng chiếu' },
];

const QUICK_STATUS_OPTIONS = [
  { value: 'auto', label: 'Tự động (Theo ngày)' },
  { value: 'showing', label: 'Đang chiếu' },
  { value: 'coming_soon', label: 'Sắp chiếu' },
  { value: 'ended', label: 'Ngừng chiếu' },
];

export default function AdminMovies() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieToDelete, setMovieToDelete] = useState(null);

  const { data, isFetching } = useQuery({
    queryKey: ['admin-movies', page, statusFilter],
    queryFn: async () => {
      const params = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      const res = await movieApi.getAll(params);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => movieApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa phim thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setMovieToDelete(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Không thể xóa phim này'
      );
      setMovieToDelete(null);
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status }) => movieApi.update(id, { status }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái phim!');
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message ||
          'Không thể cập nhật trạng thái phim'
      ),
  });

  const handleOpenCreateModal = () => {
    setEditingMovieId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id) => {
    setEditingMovieId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovieId(null);
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
    queryClient.invalidateQueries({ queryKey: ['movies'] });
    handleCloseModal();
  };

  const rawMovies = useMemo(
    () =>
      data?.movie ||
      data?.movies ||
      data?.data ||
      (Array.isArray(data) ? data : []),
    [data]
  );
  const totalPages = data?.total_pages || 1;

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawMovies;
    return rawMovies.filter(
      (m) =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.genre || '').toLowerCase().includes(q)
    );
  }, [rawMovies, searchQuery]);

  const getEffectiveStatusInfo = useCallback((movie) => {
    const rawStatus = movie?.status || 'auto';
    if (rawStatus === 'ended') {
      return {
        label: 'Ngừng chiếu',
        variant: 'rose',
        isManual: true,
        rawStatus,
      };
    }
    if (rawStatus === 'showing') {
      return {
        label: 'Đang chiếu (Thủ công)',
        variant: 'emerald',
        isManual: true,
        rawStatus,
      };
    }
    if (rawStatus === 'coming_soon') {
      return {
        label: 'Sắp chiếu (Thủ công)',
        variant: 'gold',
        isManual: true,
        rawStatus,
      };
    }
    const isShowing = movie?.release_date
      ? new Date(movie.release_date) <= new Date()
      : true;
    return {
      label: isShowing ? 'Đang chiếu (Tự động)' : 'Sắp chiếu (Tự động)',
      variant: isShowing ? 'emerald' : 'gold',
      isManual: false,
      rawStatus: 'auto',
    };
  }, []);

  const renderStatusSelect = useCallback(
    (movie) => {
      const info = getEffectiveStatusInfo(movie);
      const colorClass =
        info.variant === 'emerald'
          ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-400'
          : info.variant === 'rose'
            ? 'border-rose-500/35 bg-rose-500/15 text-rose-400'
            : 'border-cinema-gold/40 bg-cinema-gold/15 text-cinema-gold';

      return (
        <select
          value={info.rawStatus}
          disabled={quickStatusMutation.isPending}
          onChange={(e) => {
            e.stopPropagation();
            quickStatusMutation.mutate({
              id: movie.id,
              status: e.target.value,
            });
          }}
          onClick={(e) => e.stopPropagation()}
          title="Đổi nhanh trạng thái phim"
          className={`rounded-md border px-2 py-1 text-xs font-bold outline-none cursor-pointer transition ${colorClass}`}
        >
          {QUICK_STATUS_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#121324] text-white font-semibold"
            >
              {opt.value === 'auto' ? info.label : opt.label}
            </option>
          ))}
        </select>
      );
    },
    [getEffectiveStatusInfo, quickStatusMutation]
  );

  const columns = useMemo(
    () => [
      {
        title: 'Phim điện ảnh',
        dataIndex: 'title',
        render: (title, movie) => (
          <div className="flex items-center gap-3.5 min-w-[260px]">
            <img
              src={
                movie.thumbnail ||
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop'
              }
              alt={title}
              loading="lazy"
              className="w-11 h-16 object-cover rounded border border-white/10 shrink-0 bg-[#1B1E36]"
            />
            <div className="min-w-0 space-y-1">
              <div className="font-bold text-sm text-white line-clamp-1">
                {title}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-medium text-cinema-text-muted">
                  {movie.genre || 'Chưa phân loại'}
                </span>
                {movie.age_rating && (
                  <Badge variant="rose" size="sm">
                    {movie.age_rating}
                  </Badge>
                )}
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-cinema-gold hover:underline"
                  >
                    Trailer <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Thời lượng',
        dataIndex: 'duration_minutes',
        width: '125px',
        render: (duration) => (
          <div className="flex items-center gap-1.5 text-xs text-cinema-text tabular-nums font-medium">
            <Clock className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
            <span>{duration} phút</span>
          </div>
        ),
      },
      {
        title: 'Khởi chiếu',
        dataIndex: 'release_date',
        width: '135px',
        render: (releaseDate) => (
          <div className="flex items-center gap-1.5 text-xs text-cinema-text tabular-nums">
            <Calendar className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
            <span>
              {releaseDate
                ? new Date(releaseDate).toLocaleDateString('vi-VN')
                : '—'}
            </span>
          </div>
        ),
      },
      {
        title: 'Trạng thái (Sửa nhanh)',
        key: 'status',
        width: '190px',
        render: (_, movie) => renderStatusSelect(movie),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: '210px',
        align: 'right',
        render: (_, movie) => (
          <div className="flex items-center justify-end gap-1.5">
            <Link to={`/admin/movies/${movie.id}/showtimes`}>
              <button
                type="button"
                title="Quản lý lịch chiếu của phim"
                className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded border border-cinema-gold/30 bg-cinema-gold/10 text-xs font-semibold text-cinema-gold transition hover:bg-cinema-gold hover:text-cinema-bg cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lịch chiếu</span>
              </button>
            </Link>

            <button
              type="button"
              title="Chỉnh sửa thông tin phim"
              onClick={() => handleOpenEditModal(movie.id)}
              className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted transition hover:border-blue-400/50 hover:text-blue-400 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title="Xóa phim"
              onClick={() => setMovieToDelete(movie)}
              className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted transition hover:border-red-400/50 hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [renderStatusSelect]
  );

  return (
    <div className="space-y-4">
      {/* Control & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-md border border-white/10 bg-[#121324] p-3">
        {/* Left: Status Tabs + Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          <div className="flex flex-wrap items-center gap-1 bg-[#0B0C16] p-1 rounded-md border border-white/[0.06] shrink-0">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-cinema-gold text-cinema-bg font-bold'
                      : 'text-cinema-text-muted hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-cinema-text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên phim hoặc thể loại..."
              className="w-full rounded-md border border-white/10 bg-[#0E101E] pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-cinema-text-dim outline-none focus:border-cinema-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cinema-text-dim hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: View Mode Switcher + Add Movie Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
          <div className="flex items-center bg-[#0B0C16] p-1 rounded-md border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Chế độ xem bảng"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1F223D] text-cinema-gold border border-white/10'
                  : 'text-cinema-text-dim hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bảng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Chế độ xem lưới"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#1F223D] text-cinema-gold border border-white/10'
                  : 'text-cinema-text-dim hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="rounded-md font-bold tracking-wide shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm Phim Mới
          </Button>
        </div>
      </div>

      {/* Content Area: Table or Grid */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredMovies}
          loading={!data}
          isFetching={isFetching}
          loadingMessage="Đang tải danh sách phim..."
          emptyMessage="Không tìm thấy bộ phim nào phù hợp."
          emptyIcon={Film}
          pagination={{
            page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      ) : (
        <div className="space-y-4">
          {!data ? (
            <div className="py-16 text-center text-xs text-cinema-text-muted">
              Đang tải danh sách phim...
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-[#121324] py-14 text-center text-cinema-text-muted space-y-2">
              <Film className="w-8 h-8 text-cinema-text-dim mx-auto" />
              <p className="text-xs font-medium">
                Không tìm thấy bộ phim nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="rounded-md border border-white/10 bg-[#121324] overflow-hidden flex flex-col justify-between hover:border-white/20 transition-colors"
                >
                  <div className="flex gap-3.5 p-3.5">
                    <img
                      src={
                        movie.thumbnail ||
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop'
                      }
                      alt={movie.title}
                      loading="lazy"
                      className="w-20 h-28 object-cover rounded border border-white/10 shrink-0 bg-[#1B1E36]"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div>{renderStatusSelect(movie)}</div>
                      <h4
                        className="m-0 font-bold text-sm text-white line-clamp-2 leading-snug"
                        title={movie.title}
                      >
                        {movie.title}
                      </h4>
                      <p className="m-0 text-[11px] text-cinema-text-dim truncate">
                        {movie.genre || 'Chưa phân loại'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-cinema-text-muted pt-0.5 tabular-nums">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cinema-gold" />
                          {movie.duration_minutes}p
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cinema-gold" />
                          {movie.release_date
                            ? new Date(movie.release_date).toLocaleDateString(
                                'vi-VN'
                              )
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] bg-[#16182D] px-3.5 py-2.5">
                    <Link
                      to={`/admin/movies/${movie.id}/showtimes`}
                      className="flex-1"
                    >
                      <button
                        type="button"
                        className="w-full inline-flex h-7 items-center justify-center gap-1.5 px-2.5 rounded border border-cinema-gold/30 bg-cinema-gold/10 text-xs font-semibold text-cinema-gold hover:bg-cinema-gold hover:text-cinema-bg transition cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Lịch chiếu</span>
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(movie.id)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:text-blue-400 hover:border-blue-400/50 transition cursor-pointer"
                      title="Sửa phim"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovieToDelete(movie)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:text-red-400 hover:border-red-400/50 transition cursor-pointer"
                      title="Xóa phim"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination for Grid View */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#121324] px-4 py-3">
              <span className="text-xs text-cinema-text-muted">
                Trang <strong className="text-cinema-gold">{page}</strong> /{' '}
                {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage(page - 1)}
                  className="rounded-md h-8 px-2.5 text-xs"
                >
                  &larr; Trước
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage(page + 1)}
                  className="rounded-md h-8 px-2.5 text-xs"
                >
                  Sau &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <AdminMovieForm
          movieId={editingMovieId}
          onClose={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* Delete Movie Confirmation Modal */}
      <Modal
        isOpen={Boolean(movieToDelete)}
        onClose={() => setMovieToDelete(null)}
        className="max-w-md"
      >
        <Modal.Header>
          <div className="flex items-center gap-2 font-display font-bold text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Xác Nhận Xóa Phim</span>
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-2.5 text-sm">
          <p className="m-0 text-cinema-text">
            Bạn có chắc chắn muốn xóa bộ phim{' '}
            <strong className="text-white">{movieToDelete?.title}</strong> khỏi
            hệ thống?
          </p>
          <p className="m-0 text-xs text-cinema-text-muted">
            Lưu ý: Không thể xóa phim nếu đang có suất chiếu sắp diễn ra.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMovieToDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={() =>
              movieToDelete && deleteMutation.mutate(movieToDelete.id)
            }
            className="!bg-rose-600 hover:!bg-rose-500 !text-white font-bold"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}