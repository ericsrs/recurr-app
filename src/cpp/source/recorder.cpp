// recorder.cpp

#include "../headers/recorder.h"


Recorder& Recorder::instance()
{
    static Recorder rec;
    return rec;
}


void Recorder::start()
{
    if (keyHook || mouseHook) return;  

    recordedKeyEvents.clear();

    startTime    = 0;
    buttonsHeld  = 0;
    lastMoveTime = 0;

    keyHook   = SetWindowsHookEx(WH_KEYBOARD_LL, KeyboardProc, GetModuleHandle(nullptr), 0);
    mouseHook = SetWindowsHookEx(WH_MOUSE_LL,    MouseProc,    GetModuleHandle(nullptr), 0);

    if (!keyHook || !mouseHook)
    {
        std::cerr << "Failed to install hooks\n";

        if (keyHook)   { UnhookWindowsHookEx(keyHook);   keyHook   = NULL; }
        if (mouseHook) { UnhookWindowsHookEx(mouseHook); mouseHook = NULL; }
        return;
    }

    std::cerr << "Recording started...\n";
}


void Recorder::stop()
{
    if (keyHook)   { UnhookWindowsHookEx(keyHook);   keyHook   = NULL; }
    if (mouseHook) { UnhookWindowsHookEx(mouseHook); mouseHook = NULL; }

    size_t n = recordedKeyEvents.size();
    if (!recordedKeyEvents.empty() &&
        recordedKeyEvents.back().vkCode == VK_LBUTTON && !recordedKeyEvents.back().keyDown)
    {
        // find the matching left-down, skipping move events in between
        size_t i = recordedKeyEvents.size() - 1;
        while (i > 0 && recordedKeyEvents[i - 1].vkCode == 0)
            i--;

        if (i > 0 && recordedKeyEvents[i - 1].vkCode == VK_LBUTTON && recordedKeyEvents[i - 1].keyDown)
            recordedKeyEvents.erase(recordedKeyEvents.begin() + (i - 1), recordedKeyEvents.end());
    }

    std::cerr << "Recording stopped...\n";
}


json Recorder::getEventsAsJson() const
{
    json output = json::array();

    for (const auto& event : recordedKeyEvents)
    {
        output.push_back({
            {"vkCode",    event.vkCode},
            {"keyDown",   event.keyDown},
            {"timestamp", event.timestamp},
            {"x",         event.x},
            {"y",         event.y}
        });
    }

    return output;
}


void Recorder::push(DWORD vk, bool down, DWORD time, LONG x, LONG y)
{
    if (startTime == 0)
        startTime = time;

    KeyEvent event(vk, down, time - startTime, x, y);
    recordedKeyEvents.push_back(event);
}



LRESULT CALLBACK Recorder::KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode == HC_ACTION)
    {
        auto* key = (KBDLLHOOKSTRUCT*)lParam;

        if (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN)
            instance().push(key->vkCode, true, key->time);
        else if (wParam == WM_KEYUP || wParam == WM_SYSKEYUP)
            instance().push(key->vkCode, false, key->time);
    }

    return CallNextHookEx(instance().keyHook, nCode, wParam, lParam);
}


LRESULT CALLBACK Recorder::MouseProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode == HC_ACTION)
    {
        auto* m = (MSLLHOOKSTRUCT*)lParam;
        Recorder& r = instance();

        switch (wParam)
        {
            case WM_LBUTTONDOWN: r.buttonsHeld++; r.push(VK_LBUTTON, true,  m->time, m->pt.x, m->pt.y); break;
            case WM_RBUTTONDOWN: r.buttonsHeld++; r.push(VK_RBUTTON, true,  m->time, m->pt.x, m->pt.y); break;
            case WM_MBUTTONDOWN: r.buttonsHeld++; r.push(VK_MBUTTON, true,  m->time, m->pt.x, m->pt.y); break;

            case WM_LBUTTONUP:   if (r.buttonsHeld > 0) r.buttonsHeld--; r.push(VK_LBUTTON, false, m->time, m->pt.x, m->pt.y); break;
            case WM_RBUTTONUP:   if (r.buttonsHeld > 0) r.buttonsHeld--; r.push(VK_RBUTTON, false, m->time, m->pt.x, m->pt.y); break;
            case WM_MBUTTONUP:   if (r.buttonsHeld > 0) r.buttonsHeld--; r.push(VK_MBUTTON, false, m->time, m->pt.x, m->pt.y); break;

            case WM_MOUSEMOVE:
                // only record the path while a button is held, at most every 10 ms
                if (r.buttonsHeld > 0 && m->time - r.lastMoveTime >= 10)
                {
                    r.lastMoveTime = m->time;
                    r.push(0, true, m->time, m->pt.x, m->pt.y);   // vkCode 0 = move
                }
                break;

            default: break;   // wheel etc. ignored
        }
    }

    return CallNextHookEx(instance().mouseHook, nCode, wParam, lParam);
}