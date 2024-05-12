import * as React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

function ChatLoading() {
  return (
    <Box sx={{ width: 250, mt: 5, px: 2 }}>
      <Skeleton variant="rounded" width={270} height={30} animation="pulse" />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={270} height={30} animation="wave" />
      </Box>
    </Box>
  );
}

export default ChatLoading;
