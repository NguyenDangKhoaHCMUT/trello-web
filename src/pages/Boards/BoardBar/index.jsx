import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const MENU_STYLES = {
  color: 'primary.main',
  backgroundColor: 'white',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': { // change icon color
    color: 'primary.main'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function index() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      borderTop: '1px solid #00bfa5'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label="Nguyen Dang Khoa"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<PersonAddIcon/>}>Invite</Button>
        <AvatarGroup
          max={7}
          sx={{
            '& .MuiAvatar-root': {
              width: '34px',
              height: '34px',
              fontSize: '16px'
            }
          }}
        >
          {/* max là 4 thì sẽ hiển thị 3 avatar và 1 chữ số */}
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
          <Tooltip title="NguyenDangKhoa">
            <Avatar
              alt="NguyenDangKhoa"
              src='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688' 
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default index
