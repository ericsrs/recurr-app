// recorder.cpp

#include "../headers/recorder.h"


Recorder& Recorder::instance()
{
    static Recorder rec;
    return rec;
}


void Recorder::start()
{
    recordedKeyEvents.clear();
    startTime = 0;

    hook = SetWindowsHookEx(
        WH_KEYBOARD_LL,
        KeyboardProc,
        GetModuleHandle(nullptr),
        0
    );

    if (!hook)
    {
        std::cerr << "Failed to install hook\n";
        return;
    }

    std::cerr << "Recording started...\n";
}


void Recorder::stop()
{
    if (hook)
    {
        UnhookWindowsHookEx(hook);
        hook = NULL;
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
            {"timestamp", event.timestamp}
        });
    }

    return output;
}


LRESULT CALLBACK Recorder::KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode == HC_ACTION)
    {
        KBDLLHOOKSTRUCT* keyData = (KBDLLHOOKSTRUCT*)lParam;

        if (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN)
        {
            // first event anchors the clock
            if (instance().startTime == 0)
                instance().startTime = keyData->time;

            DWORD timestamp = keyData->time - instance().startTime;
            instance().recordedKeyEvents.push_back(KeyEvent(keyData->vkCode, true, timestamp));
        }
        else if (wParam == WM_KEYUP || wParam == WM_SYSKEYUP)
        {
            if (instance().startTime == 0)
                instance().startTime = keyData->time;

            DWORD timestamp = keyData->time - instance().startTime;
            instance().recordedKeyEvents.push_back(KeyEvent(keyData->vkCode, false, timestamp));
        }
    }

    return CallNextHookEx(instance().hook, nCode, wParam, lParam);
}