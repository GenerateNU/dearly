import { commentPopUpAttributes } from "@/types/comment";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { createContext, ReactNode, useContext, useRef, useState } from "react";

interface FeedContextType {
  commentAttributes: commentPopUpAttributes;
  setCommentAttributes: (attributes: commentPopUpAttributes) => void;
  likePostId: string;
  setLikePostId: (id: string) => void;
  commentRef: React.RefObject<BottomSheetMethods> | null;
  likeRef: React.RefObject<BottomSheetMethods> | null;
}

const FeedContext = createContext<FeedContextType>({
  commentAttributes: { commentId: "", caption: "", likes: 0 },
  setCommentAttributes: () => {},
  likePostId: "",
  setLikePostId: () => {},
  commentRef: null,
  likeRef: null,
});

export const useFeedContext = (): FeedContextType => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext must be used within a FeedContextProvider");
  }
  return context;
};

interface FeedProviderProps {
  children: ReactNode;
}

export const FeedContextProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [commentAttributes, setCommentAttributes] = useState<commentPopUpAttributes>({
    commentId: "",
    caption: "",
    likes: 0,
  });
  const [likePostId, setLikePostId] = useState<string>("");

  return (
    <FeedContext.Provider
      value={{
        commentAttributes,
        setCommentAttributes,
        likePostId,
        setLikePostId,
        commentRef: useRef<BottomSheet>(null),
        likeRef: useRef<BottomSheet>(null),
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};
