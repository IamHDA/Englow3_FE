import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  BlockedUserPageResponse,
  FriendCountResponse,
  FriendPageResponse,
  FriendRequestOutcomeResponse,
  FriendRequestPageResponse,
  IncomingRequestCountResponse,
  LearnerSearchPageResponse,
  RelationshipResponse,
  SendFriendRequestRequest,
} from "./friendship.types.js";

const FRIENDS_BASE_PATH = "/api/friends";
const BLOCKS_BASE_PATH = `${FRIENDS_BASE_PATH}/blocks`;
const REQUESTS_BASE_PATH = `${FRIENDS_BASE_PATH}/requests`;

type PageParams = { page: number; size: number };

export class FriendshipApi {
  constructor(private readonly client: BackendClient) {}

  friends(params: PageParams): Promise<FriendPageResponse> {
    return this.client.get(`${FRIENDS_BASE_PATH}?${toQueryString(params)}`);
  }

  search(
    params: PageParams & { q: string },
  ): Promise<LearnerSearchPageResponse> {
    return this.client.get(
      `${FRIENDS_BASE_PATH}/search?${toQueryString(params)}`,
    );
  }

  relationship(userId: string): Promise<RelationshipResponse> {
    return this.client.get(
      `${FRIENDS_BASE_PATH}/relationships/${encodeURIComponent(userId)}`,
    );
  }

  friendCount(userId: string): Promise<FriendCountResponse> {
    return this.client.get(
      `${FRIENDS_BASE_PATH}/users/${encodeURIComponent(userId)}/count`,
    );
  }

  incoming(params: PageParams): Promise<FriendRequestPageResponse> {
    return this.client.get(
      `${REQUESTS_BASE_PATH}/incoming?${toQueryString(params)}`,
    );
  }

  incomingCount(): Promise<IncomingRequestCountResponse> {
    return this.client.get(`${REQUESTS_BASE_PATH}/incoming/count`);
  }

  outgoing(params: PageParams): Promise<FriendRequestPageResponse> {
    return this.client.get(
      `${REQUESTS_BASE_PATH}/outgoing?${toQueryString(params)}`,
    );
  }

  send(addresseeId: string): Promise<FriendRequestOutcomeResponse> {
    const body: SendFriendRequestRequest = { addresseeId };
    return this.client.post(REQUESTS_BASE_PATH, body);
  }

  accept(requestId: string): Promise<FriendRequestOutcomeResponse> {
    return this.client.post(
      `${REQUESTS_BASE_PATH}/${encodeURIComponent(requestId)}/accept`,
    );
  }

  /** 204: declines a request sent to the caller, or cancels one the caller sent. */
  async withdraw(requestId: string): Promise<void> {
    await this.client.delete(
      `${REQUESTS_BASE_PATH}/${encodeURIComponent(requestId)}`,
    );
  }

  /** 204 */
  async unfriend(userId: string): Promise<void> {
    await this.client.delete(
      `${FRIENDS_BASE_PATH}/${encodeURIComponent(userId)}`,
    );
  }

  blocked(params: PageParams): Promise<BlockedUserPageResponse> {
    return this.client.get(`${BLOCKS_BASE_PATH}?${toQueryString(params)}`);
  }

  /** 204 */
  async block(userId: string): Promise<void> {
    await this.client.put(`${BLOCKS_BASE_PATH}/${encodeURIComponent(userId)}`);
  }

  /** 204 */
  async unblock(userId: string): Promise<void> {
    await this.client.delete(
      `${BLOCKS_BASE_PATH}/${encodeURIComponent(userId)}`,
    );
  }
}
