"use client";

import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";

const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();

  const playerRef = useRef<ReactPlayer>(null);

  // Derive the video URL safely: only use it if the chapter type is "Video"
  const videoUrl =
      currentChapter?.type === "Video" && currentChapter?.video
          ? (currentChapter.video as string)
          : null;

  const handleProgress = ({ played }: { played: number }) => {
    if (
        played >= 0.8 &&
        !hasMarkedComplete &&
        currentChapter &&
        currentSection &&
        userProgress?.sections &&
        !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
          currentSection.sectionId,
          currentChapter.chapterId,
          true
      );
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  // Render the appropriate content block based on chapter type
  const renderChapterContent = () => {
    if (!currentChapter) return null;

    switch (currentChapter.type) {
      case "Video":
        return (
            <Card className="course__video">
              <CardContent className="course__video-container">
                {videoUrl ? (
                    <ReactPlayer
                        ref={playerRef}
                        url={videoUrl}
                        controls
                        width="100%"
                        height="100%"
                        onProgress={handleProgress}
                        config={{
                          file: {
                            attributes: {
                              controlsList: "nodownload",
                            },
                          },
                        }}
                    />
                ) : (
                    <div className="course__no-video">
                      No video available for this chapter.
                    </div>
                )}
              </CardContent>
            </Card>
        );

      case "Quiz":
        return (
            <Card className="course__video">
              <CardContent className="course__video-container">
                <div className="course__quiz">
                  <h3 className="course__quiz-title">{currentChapter.title}</h3>
                  <div className="course__quiz-questions">
                    {currentChapter.content
                        ?.split("\n")
                        .filter(Boolean)
                        .map((question: string, index: number) => (
                            <p key={index} className="course__quiz-question">
                              {question}
                            </p>
                        ))}
                  </div>
                  {/* Mark complete manually for quizzes since there's no video progress */}
                  {!isChapterCompleted() && currentSection && (
                      <button
                          className="course__complete-btn"
                          onClick={() => {
                            setHasMarkedComplete(true);
                            updateChapterProgress(
                                currentSection.sectionId,
                                currentChapter.chapterId,
                                true
                            );
                          }}
                      >
                        Mark as Completed
                      </button>
                  )}
                </div>
              </CardContent>
            </Card>
        );

      case "Text":
        return (
            <Card className="course__video">
              <CardContent className="course__video-container">
                <div className="course__text-content">
                  <h3>{currentChapter.title}</h3>
                  <p>{currentChapter.content}</p>
                  {/* Mark complete manually for text chapters */}
                  {!isChapterCompleted() && currentSection && (
                      <button
                          className="course__complete-btn"
                          onClick={() => {
                            setHasMarkedComplete(true);
                            updateChapterProgress(
                                currentSection.sectionId,
                                currentChapter.chapterId,
                                true
                            );
                          }}
                      >
                        Mark as Completed
                      </button>
                  )}
                </div>
              </CardContent>
            </Card>
        );

      default:
        return (
            <Card className="course__video">
              <CardContent className="course__video-container">
                <div className="course__no-video">
                  Unsupported chapter type.
                </div>
              </CardContent>
            </Card>
        );
    }
  };

  return (
      <div className="course">
        <div className="course__container">
          <div className="course__breadcrumb">
            <div className="course__path">
              {course.title} / {currentSection?.sectionTitle} /{" "}
              <span className="course__current-chapter">
              {currentChapter?.title}
            </span>
            </div>
            <h2 className="course__title">{currentChapter?.title}</h2>
            <div className="course__header">
              <div className="course__instructor">
                <Avatar className="course__avatar">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="course__avatar-fallback">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="course__instructor-name">
                {course.teacherName}
              </span>
              </div>
            </div>
          </div>

          {/* Dynamically renders Video, Quiz, or Text based on chapter type */}
          {renderChapterContent()}

          <div className="course__content">
            <Tabs defaultValue="Notes" className="course__tabs">
              <TabsList className="course__tabs-list">
                <TabsTrigger className="course__tab" value="Notes">
                  Notes
                </TabsTrigger>
                <TabsTrigger className="course__tab" value="Resources">
                  Resources
                </TabsTrigger>
                <TabsTrigger className="course__tab" value="Quiz">
                  Quiz
                </TabsTrigger>
              </TabsList>

              <TabsContent className="course__tab-content" value="Notes">
                <Card className="course__tab-card">
                  <CardHeader className="course__tab-header">
                    <CardTitle>Notes Content</CardTitle>
                  </CardHeader>
                  <CardContent className="course__tab-body">
                    {currentChapter?.content}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="course__tab-content" value="Resources">
                <Card className="course__tab-card">
                  <CardHeader className="course__tab-header">
                    <CardTitle>Resources Content</CardTitle>
                  </CardHeader>
                  <CardContent className="course__tab-body">
                    {/* Add resources content here */}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="course__tab-content" value="Quiz">
                <Card className="course__tab-card">
                  <CardHeader className="course__tab-header">
                    <CardTitle>Quiz Content</CardTitle>
                  </CardHeader>
                  <CardContent className="course__tab-body">
                    {currentChapter?.type === "Quiz" && currentChapter?.content
                        ? currentChapter.content
                            .split("\n")
                            .filter(Boolean)
                            .map((question: string, index: number) => (
                                <p key={index}>{question}</p>
                            ))
                        : "No quiz available for this chapter."}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="course__instructor-card">
              <CardContent className="course__instructor-info">
                <div className="course__instructor-header">
                  <Avatar className="course__instructor-avatar">
                    <AvatarImage alt={course.teacherName} />
                    <AvatarFallback className="course__instructor-avatar-fallback">
                      {course.teacherName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="course__instructor-details">
                    <h4 className="course__instructor-name">
                      {course.teacherName}
                    </h4>
                    <p className="course__instructor-title">Senior UX Designer</p>
                  </div>
                </div>
                <div className="course__instructor-bio">
                  <p>
                    A seasoned Senior UX Designer with over 15 years of experience
                    in creating intuitive and engaging digital experiences.
                    Expertise in leading UX design projects.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Course;