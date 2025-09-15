import { useState } from "react";
import LessonPage from "./pages/LessonPage";
import CreateBlogPage from "./pages/CreateBlogPage";
import BlogManagementPage from "./pages/BlogManagementPage";

function App() {
  const [currentPage, setCurrentPage] = useState("lesson");
  const [createdBlogs, setCreatedBlogs] = useState([]);

  const navigateToCreateBlog = () => {
    setCurrentPage("create");
  };

  const navigateToBlogManagement = () => {
    setCurrentPage("manage");
  };

  const navigateToLesson = () => {
    setCurrentPage("lesson");
  };

  const handleBlogCreated = (newBlog) => {
    setCreatedBlogs([...createdBlogs, newBlog]);
    console.log("New blog created:", newBlog);
  };

  return (
    <div className="App">
      {currentPage === "lesson" && (
        <LessonPage 
          onNavigateToCreate={navigateToCreateBlog}
          onNavigateToManage={navigateToBlogManagement}
        />
      )}
      {currentPage === "create" && (
        <CreateBlogPage 
          onNavigateBack={navigateToLesson}
          onBlogCreated={handleBlogCreated}
        />
      )}
      {currentPage === "manage" && (
        <BlogManagementPage 
          onNavigateBack={navigateToLesson}
        />
      )}
    </div>
  );
}

export default App;