import * as React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

function ChatLoading() {
  return (
    <Box sx={{ width: 250, mt: 5, px: 2 }}> {/* Adjust width and add padding */}
      <Skeleton variant="rounded" width={270} height={30} animation="pulse" /> {/* Adjust width and height */}
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
      <Box sx={{ mt: 2 }}> {/* Add margin-top for space */}
        <Skeleton variant="rounded" width={270} height={30} animation="wave" /> {/* Adjust width and height */}
      </Box>
   
    </Box>
  );
}

export default ChatLoading;
