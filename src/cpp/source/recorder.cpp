// recorder.cpp

#include "Recorder.h"

#include <iostream> /* cout */


Recorder& Recorder::instance()
{
    static Recorder rec;
    return rec;
}


void Recorder::start()
{
    recordedKeyEvents.clear();

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

        if (wParam == WM_KEYDOWN)
        {
            std::cerr << "Key down: " << keyData->vkCode << "\n";

            if (keyData->vkCode == VK_ESCAPE)
            {
                std::cerr << "Exiting recording...\n";
                PostQuitMessage(0);
            }
            else
            {
                KeyEvent event(keyData->vkCode, true, -1); // -1 timestamp temporarily
                instance().recordedKeyEvents.push_back(event);
            }
        }
    }

    return CallNextHookEx(instance().hook, nCode, wParam, lParam);
}