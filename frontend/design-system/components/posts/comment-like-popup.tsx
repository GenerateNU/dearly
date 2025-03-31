import { useFeedContext } from "@/contexts/feed-post-context";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { CommentPopUp } from "../comments/comment-popup";
import { LikePopup } from "./like-popup";

interface CommentLikesPopupProps {
  commentRef: React.RefObject<BottomSheetMethods>;
  likeRef: React.RefObject<BottomSheetMethods>;
}

export const CommentLikesPopup: React.FC<CommentLikesPopupProps> = ({ commentRef, likeRef }) => {
  const { commentAttributes, likePostId } = useFeedContext();

  return (
    <>
      <CommentPopUp ref={commentRef} attributes={commentAttributes} />
      <LikePopup ref={likeRef} postId={likePostId} />
    </>
  );
};
