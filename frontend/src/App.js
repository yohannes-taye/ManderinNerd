import { useState } from "react";
import LessonPage from "./pages/LessonPage";
import CreateBlogPage from "./pages/CreateBlogPage";

function App() {
  const [currentPage, setCurrentPage] = useState("lesson");
  const [createdBlogs, setCreatedBlogs] = useState([]);

  const navigateToCreateBlog = () => {
    setCurrentPage("create");
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
        <LessonPage onNavigateToCreate={navigateToCreateBlog} />
      )}
      {currentPage === "create" && (
        <CreateBlogPage 
          onNavigateBack={navigateToLesson}
          onBlogCreated={handleBlogCreated}
        />
      )}
    </div>
  );
}

export default App;