import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useParams, useNavigate } from "react-router-dom"
import { newsData, newsCategories } from "@/data/newsData"
import { Calendar, Eye, ArrowLeft, Share2 } from "lucide-react"

function NewsDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const news = newsData.find(n => n.slug === slug)
  
  if (!news) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h1>
            <Button onClick={() => navigate('/news')} className="bg-orange-400 hover:bg-orange-700">
              <ArrowLeft className="mr-2" size={16} />
              Quay lại tin tức
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const relatedNews = newsData
    .filter(n => n.category === news.category && n.id !== news.id)
    .slice(0, 3)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Image */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-8">
                  {/* Back Button */}
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/news')}
                    className="mb-4 hover:bg-blue-50"
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Quay lại
                  </Button>

                  {/* Category Badge */}
                  <Badge className="mb-4 bg-orange-400">
                    {newsCategories.find(c => c.id === news.category)?.name}
                  </Badge>

                  {/* Title */}
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {news.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(news.publishedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>{news.views.toLocaleString()} lượt xem</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="ml-auto hover:bg-blue-50"
                    >
                      <Share2 size={16} className="mr-2" />
                      Chia sẻ
                    </Button>
                  </div>

                  {/* Excerpt */}
                  <p className="text-lg text-gray-700 font-semibold mb-6 leading-relaxed">
                    {news.excerpt}
                  </p>

                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 bg-white shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Tin tức liên quan
                  </h3>
                  
                  {relatedNews.length === 0 ? (
                    <p className="text-gray-500 text-sm">Không có tin tức liên quan</p>
                  ) : (
                    <div className="space-y-4">
                      {relatedNews.map((relatedItem) => (
                        <div 
                          key={relatedItem.id}
                          onClick={() => navigate(`/news/${relatedItem.slug}`)}
                          className="cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <img 
                              src={relatedItem.imageUrl} 
                              alt={relatedItem.title}
                              className="w-24 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-800 transition-colors">
                                {relatedItem.title}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                <span>{formatDate(relatedItem.publishedDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    onClick={() => navigate('/news')}
                    className="w-full mt-6 bg-orange-400 hover:bg-orange-700"
                  >
                    Xem tất cả tin tức
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </div>
      <Footer />
    </>
  )
}

export default NewsDetail
