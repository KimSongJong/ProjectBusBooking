import { useState, useEffect } from "react";
import LeftTaskBar from "@/components/LeftTaskBar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaEye } from "react-icons/fa";
import adminApi from "@/config/adminAxios";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

function AdminFeedback() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let endpoint = "/admin/contact-messages";
      let params = {};

      // Use /filter endpoint when status filter is applied
      if (statusFilter !== "all") {
        endpoint = "/admin/contact-messages/filter";
        params = { status: statusFilter };
      }

      const result = await adminApi.get(endpoint, params);
      if (result.success && result.data) {
        setMessages(result.data);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Không thể tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);

    // Mark as read if status is new
    if (message.status === "new") {
      try {
        // Backend uses @RequestParam, so pass as query params
        await adminApi.patch(`/admin/contact-messages/${message.id}/status`, null, {
          params: { status: "read" }
        });
        fetchMessages(); // Refresh list
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      // Backend uses @RequestParam, so pass as query params
      const result = await adminApi.patch(`/admin/contact-messages/${id}/status`, null, {
        params: { status: newStatus }
      });
      if (result.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchMessages();
        if (selectedMessage?.id === id) {
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "Mới", className: "bg-blue-100 text-blue-800" },
      read: { label: "Đã đọc", className: "bg-gray-100 text-gray-800" },
      replied: { label: "Đã trả lời", className: "bg-green-100 text-green-800" },
      resolved: { label: "Đã giải quyết", className: "bg-purple-100 text-purple-800" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftTaskBar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý phản hồi</h1>
          <p className="text-slate-600 mt-1">Quản lý các liên hệ và phản hồi từ khách hàng</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, tiêu đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  Tất cả
                </Button>
                <Button
                  variant={statusFilter === "new" ? "default" : "outline"}
                  onClick={() => setStatusFilter("new")}
                  size="sm"
                >
                  Mới
                </Button>
                <Button
                  variant={statusFilter === "read" ? "default" : "outline"}
                  onClick={() => setStatusFilter("read")}
                  size="sm"
                >
                  Đã đọc
                </Button>
                <Button
                  variant={statusFilter === "replied" ? "default" : "outline"}
                  onClick={() => setStatusFilter("replied")}
                  size="sm"
                >
                  Đã trả lời
                </Button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Người gửi</TableHead>
                      <TableHead className="font-semibold">Tiêu đề</TableHead>
                      <TableHead className="font-semibold">Ngày gửi</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          Không tìm thấy liên hệ nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMessages.map((msg) => (
                        <TableRow key={msg.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{msg.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {msg.status === "new" && <FaEnvelope className="text-blue-500" />}
                                {msg.status !== "new" && <FaEnvelopeOpen className="text-gray-400" />}
                                {msg.name}
                              </div>
                              <div className="text-sm text-slate-500">{msg.email}</div>
                              {msg.phone && <div className="text-sm text-slate-500">{msg.phone}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{msg.subject}</TableCell>
                          <TableCell>{formatDate(msg.createdAt)}</TableCell>
                          <TableCell>{getStatusBadge(msg.status)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewMessage(msg)}
                                className="text-blue-950 hover:text-blue-900 hover:bg-blue-50"
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Chi tiết liên hệ</DialogTitle>
            <DialogDescription>Thông tin chi tiết về liên hệ từ khách hàng</DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {/* Sender Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-2">Thông tin người gửi</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Tên:</span>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <span className="text-slate-500">Điện thoại:</span>
                      <p className="font-medium">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Ngày gửi:</span>
                    <p className="font-medium">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h3 className="font-semibold mb-2">Tiêu đề</h3>
                <p className="text-lg">{selectedMessage.subject}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nội dung</h3>
                <div className="p-4 bg-slate-50 rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Trạng thái</h3>
                <div className="flex gap-2">
                  {getStatusBadge(selectedMessage.status)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedMessage.status !== "replied" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "replied")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Đánh dấu đã trả lời
                  </Button>
                )}
                {selectedMessage.status !== "resolved" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "resolved")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Đánh dấu đã giải quyết
                  </Button>
                )}
                {selectedMessage.status !== "read" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "read")}
                    variant="outline"
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminFeedback;

