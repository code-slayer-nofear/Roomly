import type { Review } from "../../types";
import { Avatar } from "../ui";
import StarRating from "./StarRating";
import { formatDate } from "../../utils";

export default function ReviewCard({ review }: { review: Review }) {
  const author = review.author ?? review.authorId;
  const authorName = author?.name ?? "User";
  const authorAvatar = author?.avatarUrl;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Avatar src={authorAvatar} name={authorName} size="sm" />
        <div>
          <p className="text-sm font-semibold text-gray-900">{authorName}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <StarRating rating={review.rating} />
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  );
}
