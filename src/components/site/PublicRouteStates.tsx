import { useQueryClient, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Empty, ErrorState } from "./States";

export function PublicRouteError({ error }: { error: unknown }) {
  const router = useRouter();
  const client = useQueryClient();
  const boundary = useQueryErrorResetBoundary();
  return <ErrorState error={error} retry={() => {
    boundary.reset();
    void client.resetQueries().then(() => router.invalidate());
  }} />;
}

export function PublicNotFound() {
  return <Empty>This information could not be found.</Empty>;
}