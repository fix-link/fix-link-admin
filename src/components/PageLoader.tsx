interface Props {
  fullScreen?: boolean;
}

const PageLoader = ({ fullScreen }: Props) => (
  <div
    className={
      fullScreen
        ? "flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark"
        : "flex py-20 items-center justify-center"
    }
  >
    <div
      className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
      role="status"
      aria-label="Loading"
    />
  </div>
);

export default PageLoader;
