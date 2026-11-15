// player.cpp

#include "../headers/player.h"

Player& Player::instance()
{
    static Player player;
    return player;
}


void Player::load(const std::string& macroPath)
{
    events.clear();

    std::cerr << "Opening file: " << macroPath << "\n";
    std::ifstream file(macroPath);

    if (!file.is_open())
    {
        std::cerr << "Failed to open file: " << macroPath << "\n";
        return;
    }

    json j;
    file >> j;

    for (const auto& e : j)
    {
        events.push_back(KeyEvent(
            e["vkCode"],
            e["keyDown"],
            e["timestamp"],
            e["x"],
            e["y"]
        ));
    }

    std::cerr << "Loaded " << events.size() << " events\n";
}


void Player::play()
{
    if (events.empty())
    {
        std::cerr << "No events loaded\n";
        return;
    }

    std::cerr << "Playing " << events.size() << " events\n";

    // Wait before starting macro
    Sleep(3000);

    for (size_t i = 0; i < events.size(); ++i)
    {
        if (i > 0)
        {
            DWORD gap = events[i].timestamp - events[i - 1].timestamp;
            if (gap > 0) Sleep(gap);
        }

        if (isMouseEvent(events[i].vkCode))
            sendMouse(events[i]);
        else
            sendKey(events[i].vkCode, events[i].keyDown);
    }

    releaseModifiers(); // always clean up after playback
    std::cerr << "Playback complete\n";
}


void Player::releaseModifiers()
{
    const DWORD modifiers[] = {
        VK_SHIFT, VK_LSHIFT,   VK_RSHIFT,
        VK_CONTROL, VK_LCONTROL, VK_RCONTROL,
        VK_MENU, VK_LMENU,    VK_RMENU,  // Alt
        VK_LWIN, VK_RWIN
    };

    POINT p;
    GetCursorPos(&p);

    for (DWORD vk : modifiers)
    {
        // only release if Windows thinks it's still down
        if (GetAsyncKeyState(vk) & 0x8000)
        {
            KeyEvent up(vk, false, 0, p.x, p.y);
            sendKey(vk, false);
        }
    }
}


bool Player::isMouseEvent(DWORD vk)
{
    return vk == 0 || vk == VK_LBUTTON || vk == VK_RBUTTON || vk == VK_MBUTTON;
}


void Player::sendKey(DWORD vkCode, bool keyDown)
{
    INPUT input = {};
    input.type       = INPUT_KEYBOARD;
    input.ki.wVk     = vkCode;
    input.ki.dwFlags = keyDown ? 0 : KEYEVENTF_KEYUP;

    SendInput(1, &input, sizeof(INPUT));
}


void Player::sendMouse(const KeyEvent& e)
{
    INPUT input = {};
    input.type = INPUT_MOUSE;

    const long long vx = GetSystemMetrics(SM_XVIRTUALSCREEN);
    const long long vy = GetSystemMetrics(SM_YVIRTUALSCREEN);
    const long long vw = GetSystemMetrics(SM_CXVIRTUALSCREEN);
    const long long vh = GetSystemMetrics(SM_CYVIRTUALSCREEN);

    input.mi.dx = (LONG)((e.x - vx) * 65535 / (vw - 1));
    input.mi.dy = (LONG)((e.y - vy) * 65535 / (vh - 1));
    input.mi.dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK;

    switch (e.vkCode)
    {
        case VK_LBUTTON: input.mi.dwFlags |= e.keyDown ? MOUSEEVENTF_LEFTDOWN   : MOUSEEVENTF_LEFTUP;   break;
        case VK_RBUTTON: input.mi.dwFlags |= e.keyDown ? MOUSEEVENTF_RIGHTDOWN  : MOUSEEVENTF_RIGHTUP;  break;
        case VK_MBUTTON: input.mi.dwFlags |= e.keyDown ? MOUSEEVENTF_MIDDLEDOWN : MOUSEEVENTF_MIDDLEUP; break;
        default: break;
    }

    // logging for input
    UINT sent = SendInput(1, &input, sizeof(INPUT));
    if (sent != 1)
        std::cerr << "SendInput failed, error " << GetLastError() << "\n";
}