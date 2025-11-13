import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { newsData, newsCategories } from "@/data/newsData"
import { useState } from "react"

function News() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredNews = selectedCategory === "all" 
    ? newsData 
    : newsData.filter(news => news.category === selectedCategory)

  const featuredNews = filteredNews[0]
  const otherNews = filteredNews.slice(1)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white"> 
       

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {newsCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className={selectedCategory === category.id 
                  ? "bg-orange-400 hover:bg-orange-500" 
                  : "hover:bg-blue-50"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Title Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900 border-b-4 border-blue-900 inline-block pb-2">
              Tin tức nổi bật
            </h2>
          </div>

          {filteredNews.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Không có tin tức nào trong danh mục này.
            </p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Featured News - Left Side (2 columns) */}
              {featuredNews && (
                <div className="lg:col-span-2">
                  <Card 
                    className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full"
                    onClick={() => navigate(`/news/${featuredNews.slug}`)}
                  >
                    <div className="relative">
                      <img 
                        src={featuredNews.imageUrl} 
                        alt={featuredNews.title}
                        className="w-full h-80 object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-orange-400 text-white">
                        {newsCategories.find(c => c.id === featuredNews.category)?.name}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                        {featuredNews.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {featuredNews.excerpt}
                      </p>
                      <div className="text-sm text-gray-500">
                        {formatDate(featuredNews.publishedDate)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Other News List - Right Side (1 column) */}
              {otherNews.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    {otherNews.slice(0, 3).map((news) => (
                      <Card 
                        key={news.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/news/${news.slug}`)}
                      >
                        <div className="relative">
                          <img 
                            src={news.imageUrl} 
                            alt={news.title}
                            className="w-full h-40 object-cover"
                          />
                          <Badge className="absolute top-2 left-2 bg-orange-400 text-white text-xs">
                            {newsCategories.find(c => c.id === news.category)?.name}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {news.title}
                          </h4>
                          <div className="text-xs text-gray-500">
                            {formatDate(news.publishedDate)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Grid - More News */}
          {otherNews.length > 3 && (
            <div className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {otherNews.slice(3).map((news) => (
                  <Card 
                    key={news.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/news/${news.slug}`)}
                  >
                    <div className="relative">
                      <img 
                        src={news.imageUrl} 
                        alt={news.title}
                        className="w-full h-40 object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-orange-400 text-white text-xs">
                        {newsCategories.find(c => c.id === news.category)?.name}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {news.title}
                      </h4>
                      <div className="text-xs text-gray-500">
                        {formatDate(news.publishedDate)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default News
